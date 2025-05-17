package room_temporal

import (
	"fmt"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"poker/internal/modules/room/manager"
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
	Terminated    bool
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

	var (
		cancelTimer      workflow.CancelFunc
		emptyRoomTimer   workflow.Future
		readyTimer       workflow.Future
		cancelReadyTimer workflow.CancelFunc
		hasHadPlayers    bool
	)

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
		if state.Terminated {
			break
		}

		if hasHadPlayers && len(state.Players) == 0 && emptyRoomTimer == nil {
			logger.Info("⌛ No players — starting auto-termination")
			var cancelCtx workflow.Context
			cancelCtx, cancelTimer = workflow.WithCancel(baseCtx)
			emptyRoomTimer = workflow.NewTimer(cancelCtx, 30*time.Second)
		}

		selector := workflow.NewSelector(baseCtx)

		if emptyRoomTimer != nil {
			selector.AddFuture(emptyRoomTimer, func(f workflow.Future) {
				logger.Info("🛑 Auto-termination timeout")
				state.Terminated = true
			})
		}

		if readyTimer != nil {
			selector.AddFuture(readyTimer, func(f workflow.Future) {
				logger.Info("✅ All players ready — triggering internal start")
				internalStartGameChan.Send(baseCtx, struct{}{})
				readyTimer = nil
			})
		}

		selector.AddReceive(joinChan, func(c workflow.ReceiveChannel, _ bool) {
			var s JoinRoomSignal
			c.Receive(baseCtx, &s)
			if _, exists := state.Players[s.UserID]; exists {
				logger.Warn("⚠️ Duplicate join", "userID", s.UserID)
				return
			}

			state.Players[s.UserID] = true
			hasHadPlayers = true

			if emptyRoomTimer != nil {
				cancelTimer()
				emptyRoomTimer = nil
			}

			logger.Info("👤 Player joined", zap.String("userID", s.UserID))
			sendToAllPlayers(baseCtx, roomID, state.Players, fmt.Sprintf("✅ Player %s joined", s.UserID))
		})

		selector.AddReceive(leaveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s LeaveRoomSignal
			c.Receive(baseCtx, &s)
			delete(state.Players, s.UserID)
			logger.Info("👋 Player left", zap.String("userID", s.UserID))
			sendToAllPlayers(baseCtx, roomID, state.Players, fmt.Sprintf("👋 Player %s left", s.UserID))
		})

		selector.AddReceive(startGameChan, func(c workflow.ReceiveChannel, _ bool) {
			var s StartGameSignal
			c.Receive(baseCtx, &s)
			handleStartGame(baseCtx, state, roomID, logger)
		})

		selector.AddReceive(internalStartGameChan, func(c workflow.ReceiveChannel, _ bool) {
			c.Receive(baseCtx, nil)
			handleStartGame(baseCtx, state, roomID, logger)
		})

		selector.AddReceive(readyChan, func(c workflow.ReceiveChannel, _ bool) {
			var s PlayerReadySignal
			c.Receive(baseCtx, &s)

			if state.ReadyPlayers == nil {
				state.ReadyPlayers = make(map[string]bool)
			}
			state.ReadyPlayers[s.UserID] = s.Ready

			logger.Info("🔄 Ready state changed", zap.String("userID", s.UserID), zap.Bool("ready", s.Ready))

			// Broadcast updated ready map
			actCtx := workflow.WithActivityOptions(baseCtx, workflow.ActivityOptions{
				StartToCloseTimeout: 5 * time.Second,
			})
			_ = workflow.ExecuteActivity(actCtx, SendStatusToAllActivity, SendStatusInput{
				RoomID:  roomID,
				Payload: state.ReadyPlayers,
			}).Get(actCtx, nil)

			// Trigger countdown if all ready
			allReady := true
			if len(state.ReadyPlayers) < len(state.Players) {
				allReady = false
			} else {
				for _, r := range state.ReadyPlayers {
					if !r {
						allReady = false
						break
					}
				}
			}

			if allReady {
				if len(state.Players) < 2 {
					manager.Manager.Broadcast(roomID, "🚫 Нужны хотя бы 2 игрока для старта")
					return
				}

				if readyTimer == nil {
					logger.Info("⏳ 10s until auto-start")
					var cancelCtx workflow.Context
					cancelCtx, cancelReadyTimer = workflow.WithCancel(baseCtx)
					readyTimer = workflow.NewTimer(cancelCtx, 10*time.Second)
				}
			} else if readyTimer != nil {
				cancelReadyTimer()
				readyTimer = nil
				logger.Info("❌ Not all ready — cancelled timer")
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

			if err := ValidatePlayerAction(s.Action, state, s.UserID, s.Args); err != nil {
				sendToPlayer(baseCtx, roomID, s.UserID, "❌ Invalid action: "+err.Error())
				return
			}

			entry := fmt.Sprintf("%s: %s %s", s.UserID, s.Action, strings.Join(s.Args, " "))
			state.MoveLog = append(state.MoveLog, entry)
			sendToAllPlayers(baseCtx, roomID, state.Players, entry)

			handler := ActionRegistry[s.Action]
			oldChips := state.PlayerChips[s.UserID]
			handler.Execute(state, s.UserID, s.Args)
			newChips := state.PlayerChips[s.UserID]
			if newChips < oldChips {
				amountSpent := oldChips - newChips
				actCtx := workflow.WithActivityOptions(baseCtx, workflow.ActivityOptions{
					StartToCloseTimeout: 5 * time.Second,
				})
				err := workflow.ExecuteActivity(actCtx, DeductChipsFromBalanceActivity, BalanceUpdateInput{
					UserID: s.UserID,
					Amount: amountSpent,
				}).Get(actCtx, nil)
				if err != nil {
					logger.Error("❌ Failed to deduct balance", zap.String("userID", s.UserID), zap.Error(err))
				}
			}
			state.HasActed[s.UserID] = true

			if IsBettingRoundOver(state) {
				NextTurn(baseCtx, state)
				if !state.GameStarted {
					return
				}
				NextStage(state)
				DealBoardCards(state)
				sendToAllPlayers(baseCtx, roomID, state.Players, "🃏 New stage: "+state.RoundStage)
				NextTurn(baseCtx, state)
			} else {
				NextTurn(baseCtx, state)
			}
		})

		selector.AddReceive(terminateChan, func(c workflow.ReceiveChannel, _ bool) {
			var s TerminateGameSignal
			c.Receive(baseCtx, &s)
			logger.Info("🛑 Terminate signal received")
			sendToAllPlayers(baseCtx, roomID, state.Players, "🚫 Игра остановлена админом")
			state.GameStarted = false
			state.RoundStage = "ended"
			state.Terminated = true
		})

		selector.AddFuture(workflow.NewTimer(baseCtx, tick), func(f workflow.Future) {
			logger.Info("⏰ Tick", zap.Int("players", len(state.Players)))
		})

		selector.Select(baseCtx)

		for internalStartGameChan.ReceiveAsync(nil) {
			logger.Info("⚙️ Buffered start signal triggered")
			handleStartGame(baseCtx, state, roomID, logger)
		}

		// Always send state updates
		activityCtx := workflow.WithActivityOptions(baseCtx, workflow.ActivityOptions{
			StartToCloseTimeout: 5 * time.Second,
			RetryPolicy: &temporal.RetryPolicy{
				InitialInterval:    time.Second,
				BackoffCoefficient: 2.0,
				MaximumAttempts:    3,
			},
		})

		input := GameStateActivityInput{
			RoomID:  state.RoomID,
			Players: state.Players,
			State:   *state,
		}
		_ = workflow.ExecuteActivity(activityCtx, SendGameStateActivity, input).Get(activityCtx, nil)
	}

	terminateGame(baseCtx, state, logger)
	return nil
}
