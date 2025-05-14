package room_temporal

import (
	"fmt"
	"go.temporal.io/sdk/log"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"poker/internal/modules/room/repo"
	"poker/packages/database"
	"strings"
	"time"
)

type JoinRoomSignal struct {
	UserID string
}

type DealCardsSignal struct{}

type StartGameSignal struct{}

type LeaveRoomSignal struct {
	UserID string
}
type PlayerReadySignal struct {
	UserID string
	Ready  bool
}
type TerminateGameSignal struct{}
type PlayerMoveSignal struct {
	UserID string
	Action string
	Args   []string
}

type RoomState struct {
	RoomID        string
	Players       map[string]bool
	StartTime     time.Time
	PlayerOrder   []string // порядок по кругу
	PlayerChips   map[string]int64
	PlayerFolded  map[string]bool
	PlayerAllIn   map[string]bool
	CurrentPlayer string
	CurrentBet    int64
	LastRaise     int64
	Pot           int64
	MoveLog       []string
	GameStarted   bool
	PlayerCards   map[string][]string
	Deck          []string
	BoardCards    []string
	RoundStage    string
	HasActed      map[string]bool
	PlayerBets    map[string]int64
	ReadyPlayers  map[string]bool
}

func StartRoomWorkflow(ctx workflow.Context, roomID string) error {
	baseCtx := ctx
	logger := workflow.GetLogger(baseCtx)

	state := &RoomState{
		RoomID:    roomID,
		Players:   make(map[string]bool),
		MoveLog:   []string{},
		StartTime: workflow.Now(baseCtx),
	}

	var shouldTerminate bool
	var cancelTimer workflow.CancelFunc
	var emptyRoomTimer workflow.Future
	var readyTimer workflow.Future
	var cancelReadyTimer workflow.CancelFunc
	hasHadPlayers := false

	startGameChan := workflow.GetSignalChannel(baseCtx, "start-game")
	joinChan := workflow.GetSignalChannel(baseCtx, "join-room")
	leaveChan := workflow.GetSignalChannel(baseCtx, "leave-room")
	moveChan := workflow.GetSignalChannel(baseCtx, "player-move")
	terminateChan := workflow.GetSignalChannel(baseCtx, "terminate-game")
	dealCardsChan := workflow.GetSignalChannel(baseCtx, "deal-cards")
	readyChan := workflow.GetSignalChannel(baseCtx, "player-ready")
	internalStartGameChan := workflow.NewBufferedChannel(baseCtx, 1)

	tick := time.Minute * 2

	_ = workflow.SetQueryHandler(baseCtx, "available-actions", func(userID string) ([]string, error) {
		if _, ok := state.Players[userID]; !ok {
			return nil, fmt.Errorf("player %s not in room", userID)
		}
		return GetAvailableActions(state, userID), nil
	})

	for {
		if shouldTerminate {
			break
		}

		if hasHadPlayers && len(state.Players) == 0 && emptyRoomTimer == nil {
			logger.Info("⌛ No players in room — starting 30s termination timer")
			var cancelCtx workflow.Context
			cancelCtx, cancelTimer = workflow.WithCancel(baseCtx)
			emptyRoomTimer = workflow.NewTimer(cancelCtx, 30*time.Second)
		}

		selector := workflow.NewSelector(baseCtx)

		if emptyRoomTimer != nil {
			selector.AddFuture(emptyRoomTimer, func(f workflow.Future) {
				logger.Info("🛑 Termination timer fired")
				shouldTerminate = true
			})
		}

		if readyTimer != nil {
			selector.AddFuture(readyTimer, func(f workflow.Future) {
				logger.Info("✅ Ready timer fired — signaling local start-game")
				internalStartGameChan.Send(baseCtx, struct{}{}) // 🔧
				readyTimer = nil
			})
		}

		selector.AddReceive(startGameChan, func(c workflow.ReceiveChannel, _ bool) {
			var s StartGameSignal
			c.Receive(baseCtx, &s)
			handleStartGame(baseCtx, state, roomID, logger)
		})

		selector.AddReceive(internalStartGameChan, func(c workflow.ReceiveChannel, _ bool) {
			c.Receive(baseCtx, nil)
			handleStartGame(baseCtx, state, roomID, logger)
		})

		selector.AddReceive(joinChan, func(c workflow.ReceiveChannel, _ bool) {
			var s JoinRoomSignal
			c.Receive(baseCtx, &s)

			if _, alreadyIn := state.Players[s.UserID]; alreadyIn {
				logger.Warn("🚫 Duplicate user join attempt", "userID", s.UserID)
				return
			}

			state.Players[s.UserID] = true
			hasHadPlayers = true

			if emptyRoomTimer != nil {
				logger.Info("🔄 Player rejoined — cancelling termination timer")
				cancelTimer()
				emptyRoomTimer = nil
			}

			logger.Info("👤 Player joined", "userID", s.UserID)
			sendToAllPlayers(baseCtx, state.RoomID, state.Players, fmt.Sprintf("✅ Player %s joined the room", s.UserID))
		})

		selector.AddReceive(leaveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s LeaveRoomSignal
			c.Receive(baseCtx, &s)
			delete(state.Players, s.UserID)
			logger.Info("👋 Player left", "userID", s.UserID)
			sendToAllPlayers(baseCtx, state.RoomID, state.Players, "Player "+s.UserID+" left the room")
		})

		selector.AddReceive(readyChan, func(c workflow.ReceiveChannel, _ bool) {
			var s PlayerReadySignal
			c.Receive(baseCtx, &s)

			if state.ReadyPlayers == nil {
				state.ReadyPlayers = make(map[string]bool)
			}
			state.ReadyPlayers[s.UserID] = s.Ready

			logger.Info("🟢 Ready status updated", zap.String("userID", s.UserID), zap.Bool("ready", s.Ready))
			sendToAllPlayers(baseCtx, state.RoomID, state.Players, fmt.Sprintf("🎯 %s is %s", s.UserID, boolToReady(s.Ready)))

			allReady := len(state.ReadyPlayers) == len(state.Players)
			if allReady {
				for _, ok := range state.ReadyPlayers {
					if !ok {
						allReady = false
						break
					}
				}
			}

			if allReady {
				if readyTimer == nil {
					logger.Info("⏳ All players ready. Starting 10s countdown...")
					var cancelCtx workflow.Context
					cancelCtx, cancelReadyTimer = workflow.WithCancel(baseCtx)
					readyTimer = workflow.NewTimer(cancelCtx, 10*time.Second)
				}
			} else if readyTimer != nil {
				cancelReadyTimer()
				readyTimer = nil
				logger.Info("❌ Countdown cancelled. Not all players are ready anymore.")
			}
		})

		selector.AddReceive(dealCardsChan, func(c workflow.ReceiveChannel, _ bool) {
			var s DealCardsSignal
			c.Receive(baseCtx, &s)
			futures := dealCards(baseCtx, state, roomID)
			for _, f := range futures {
				_ = f.Get(baseCtx, nil)
			}
		})

		selector.AddReceive(moveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s PlayerMoveSignal
			c.Receive(baseCtx, &s)

			err := ValidatePlayerAction(s.Action, state, s.UserID, s.Args)
			if err != nil {
				logger.Warn("🚫 Invalid player action", zap.Error(err))
				sendToPlayer(baseCtx, state.RoomID, s.UserID, fmt.Sprintf("❌ Invalid action: %s", err.Error()))
				return
			}

			entry := s.UserID + ": " + s.Action + " " + strings.Join(s.Args, " ")
			state.MoveLog = append(state.MoveLog, entry)

			logger.Info("✅ Player move", "userID", s.UserID, "action", s.Action)
			sendToAllPlayers(baseCtx, state.RoomID, state.Players, entry)

			handler := ActionRegistry[s.Action]
			handler.Execute(state, s.UserID, s.Args)

			state.HasActed[s.UserID] = true

			if IsBettingRoundOver(state) {
				NextTurn(baseCtx, state)

				if !state.GameStarted {
					return
				}

				NextStage(state)
				DealBoardCards(state)
				sendToAllPlayers(baseCtx, state.RoomID, state.Players, fmt.Sprintf("🃏 New stage: %s", state.RoundStage))

				NextTurn(baseCtx, state)
			} else {
				NextTurn(baseCtx, state)
			}
		})

		selector.AddReceive(terminateChan, func(c workflow.ReceiveChannel, _ bool) {
			var s TerminateGameSignal
			c.Receive(baseCtx, &s)
			logger.Info("Terminate")
			sendToAllPlayers(baseCtx, state.RoomID, state.Players, "🚫 Игра остановлена администратором")
			state.GameStarted = false
			state.RoundStage = "ended"
			shouldTerminate = true
		})

		selector.AddFuture(workflow.NewTimer(baseCtx, tick), func(f workflow.Future) {
			logger.Info("⏰ Tick", "players", len(state.Players))
		})

		selector.Select(baseCtx)

		for internalStartGameChan.ReceiveAsync(nil) {
			logger.Info("🧨 Buffered message in internalStartGameChan — executing fallback start")
			handleStartGame(baseCtx, state, roomID, logger)
		}

		activityCtx := workflow.WithActivityOptions(baseCtx, workflow.ActivityOptions{
			StartToCloseTimeout: 5 * time.Second,
			RetryPolicy: &temporal.RetryPolicy{
				InitialInterval:    time.Second,
				BackoffCoefficient: 2.0,
				MaximumAttempts:    3,
			},
		})

		input := GameStateActivityInput{RoomID: state.RoomID, Players: state.Players, State: *state}
		_ = workflow.ExecuteActivity(activityCtx, SendGameStateActivity, input).Get(activityCtx, nil)
	}

	terminateGame(baseCtx, state, logger)
	return nil
}

func terminateGame(ctx workflow.Context, state *RoomState, logger log.Logger) {
	logger.Info("💾 Saving history")

	ao := workflow.ActivityOptions{StartToCloseTimeout: 10 * time.Second}
	ctx = workflow.WithActivityOptions(ctx, ao)

	if err := workflow.ExecuteActivity(ctx, SaveGameHistoryActivity, state).Get(ctx, nil); err != nil {
		logger.Error("❌ Failed to save history", "err", err)
	}

	if len(state.Players) > 0 {
		err := workflow.ExecuteActivity(ctx, DisconnectAllUsersActivity, state.RoomID).Get(ctx, nil)
		if err != nil {
			logger.Error("❌ Failed to disconnect users", "err", err)
		}
	} else {
		logger.Info("ℹ️ No players to disconnect")
	}
	rr := repo.NewRoomRepo(database.DB)
	err := rr.UpdateRoomStatus(state.RoomID, "Done")
	if err != nil {
		return
	}

	logger.Info("🏁 Game ended. Terminating workflow...")
}

func NextTurn(ctx workflow.Context, state *RoomState) {
	n := len(state.PlayerOrder)
	if n == 0 {
		return
	}

	currentIdx := -1
	for i, id := range state.PlayerOrder {
		if id == state.CurrentPlayer {
			currentIdx = i
			break
		}
	}

	notFolded := 0
	canAct := []string{}
	for _, id := range state.PlayerOrder {
		if !state.PlayerFolded[id] {
			notFolded++
			if !state.PlayerAllIn[id] {
				canAct = append(canAct, id)
			}
		}
	}

	if notFolded == 1 {
		for _, id := range state.PlayerOrder {
			if !state.PlayerFolded[id] {
				msg := fmt.Sprintf("🏆 %s wins the hand (all others folded)", id)
				sendToAllPlayers(ctx, state.RoomID, state.Players, msg)

				state.RoundStage = "ended"
				state.GameStarted = false
				state.CurrentPlayer = ""
				_ = workflow.ExecuteActivity(ctx, SendWinnerPayloadActivity, state.RoomID, id, state.Players, *state).Get(ctx, nil)
				terminateGame(ctx, state, workflow.GetLogger(ctx))
				return
			}
		}
	}

	state.CurrentPlayer = ""

	if len(canAct) == 0 {
		if state.RoundStage == "river" || state.RoundStage == "showdown" {
			winner, desc := EvaluateWinner(state)
			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🏆 %s wins with %s", winner, desc))
			state.RoundStage = "ended"
			state.GameStarted = false
			state.CurrentPlayer = ""
			return
		} else {
			NextStage(state)
			DealBoardCards(state)
			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🃏 New stage: %s", state.RoundStage))
			NextTurn(ctx, state)
			return
		}
	}

	// Следующий активный
	for i := 1; i <= n; i++ {
		nextIdx := (currentIdx + i) % n
		next := state.PlayerOrder[nextIdx]
		if !state.PlayerFolded[next] && !state.PlayerAllIn[next] {
			state.CurrentPlayer = next
			sendToPlayer(ctx, state.RoomID, state.CurrentPlayer, "🟢 Your turn")
			return
		}
	}

	state.CurrentPlayer = ""
}
