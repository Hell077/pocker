package room_temporal

import (
	"fmt"
	"go.temporal.io/sdk/log"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"math/rand"
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
}

func StartRoomWorkflow(ctx workflow.Context, roomID string) error {
	logger := workflow.GetLogger(ctx)
	state := &RoomState{
		RoomID:    roomID,
		Players:   make(map[string]bool),
		MoveLog:   []string{},
		StartTime: workflow.Now(ctx),
	}

	hasHadPlayers := false

	startGameChan := workflow.GetSignalChannel(ctx, "start-game")
	joinChan := workflow.GetSignalChannel(ctx, "join-room")
	leaveChan := workflow.GetSignalChannel(ctx, "leave-room")
	moveChan := workflow.GetSignalChannel(ctx, "player-move")
	terminateChan := workflow.GetSignalChannel(ctx, "terminate-game")

	tick := time.Minute * 2

	_ = workflow.SetQueryHandler(ctx, "available-actions", func(userID string) ([]string, error) {
		if _, ok := state.Players[userID]; !ok {
			return nil, fmt.Errorf("player %s not in room", userID)
		}
		return GetAvailableActions(state, userID), nil
	})
	var shouldTerminate bool

	for {
		if shouldTerminate {
			break
		}
		selector := workflow.NewSelector(ctx)

		selector.AddReceive(startGameChan, func(c workflow.ReceiveChannel, _ bool) {
			var s StartGameSignal
			c.Receive(ctx, &s)

			if len(state.Players) == 0 {
				logger.Warn("❌ Cannot start game: no players in room")
				sendToAllPlayers(ctx, state.RoomID, state.Players, "⚠️ Game cannot start, no players in room")
				return
			}

			state.GameStarted = true
			state.PlayerOrder = make([]string, 0)
			state.PlayerChips = make(map[string]int64)
			state.PlayerFolded = make(map[string]bool)
			state.PlayerAllIn = make(map[string]bool)
			state.RoundStage = "preflop"
			state.HasActed = make(map[string]bool)
			state.PlayerBets = make(map[string]int64)

			for id := range state.Players {
				state.PlayerOrder = append(state.PlayerOrder, id)
				state.PlayerChips[id] = 1000
				state.PlayerFolded[id] = false
				state.PlayerAllIn[id] = false
			}

			if len(state.PlayerOrder) == 0 {
				logger.Error("❌ PlayerOrder is still empty after init")
				return
			}

			state.CurrentPlayer = state.PlayerOrder[0]

			logger.Info("🎮 Game started", "firstPlayer", state.CurrentPlayer)
			sendToAllPlayers(ctx, state.RoomID, state.Players, "🎮 Game started!")

			futures := dealCards(ctx, state, roomID)
			for _, f := range futures {
				if err := f.Get(ctx, nil); err != nil {
					logger.Error("❌ Failed to execute card dealing activity", "err", err)
				}
			}

			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🕓 First turn: %s", state.CurrentPlayer))
			sendToPlayer(ctx, state.RoomID, state.CurrentPlayer, "🟢 Your turn")

		})

		dealCardsChan := workflow.GetSignalChannel(ctx, "deal-cards")

		selector.AddReceive(dealCardsChan, func(c workflow.ReceiveChannel, _ bool) {
			var s DealCardsSignal
			c.Receive(ctx, &s)

			ao := workflow.ActivityOptions{
				StartToCloseTimeout: 5 * time.Second,
			}
			ctx = workflow.WithActivityOptions(ctx, ao)

			state.Deck = GenerateShuffledDeck(ctx)
			state.PlayerCards = make(map[string][]string)

			for _, playerID := range state.PlayerOrder {
				if len(state.Deck) < 2 {
					logger.Error("😨 Not enough cards to deal")
					break
				}

				cards := []string{state.Deck[0], state.Deck[1]}
				state.PlayerCards[playerID] = cards
				state.Deck = state.Deck[2:]

				eventName := fmt.Sprintf("deal-card-user-%s", playerID)
				state.MoveLog = append(state.MoveLog, eventName)

				msg := fmt.Sprintf("🎴 Your cards: %s, %s", cards[0], cards[1])
				logger.Info("📨 Dealt cards", "event", eventName, "cards", cards)

				_ = workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, playerID, msg)
			}

			sendToAllPlayers(ctx, state.RoomID, state.Players, "🃏 Cards have been dealt")
		})

		selector.AddReceive(joinChan, func(c workflow.ReceiveChannel, _ bool) {
			var s JoinRoomSignal
			c.Receive(ctx, &s)

			if _, alreadyIn := state.Players[s.UserID]; alreadyIn {
				logger.Warn("🚫 Duplicate user join attempt", "userID", s.UserID)
				sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🚫 Пользователь %s уже в комнате", s.UserID))
				return
			}

			state.Players[s.UserID] = true
			hasHadPlayers = true
			logger.Info("👤 Player joined", "userID", s.UserID)

			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("✅ Player %s joined the room", s.UserID))
		})

		selector.AddReceive(leaveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s LeaveRoomSignal
			c.Receive(ctx, &s)
			delete(state.Players, s.UserID)
			logger.Info("👋 Player left", "userID", s.UserID)

			sendToAllPlayers(ctx, state.RoomID, state.Players, "Player "+s.UserID+" left the room")
		})

		selector.AddReceive(moveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s PlayerMoveSignal
			c.Receive(ctx, &s)

			err := ValidatePlayerAction(s.Action, state, s.UserID, s.Args)
			if err != nil {
				logger.Warn("🚫 Invalid player action",
					"userID", s.UserID,
					"action", s.Action,
					"args", s.Args,
					"error", err.Error(),
				)
				sendToPlayer(ctx, state.RoomID, s.UserID, fmt.Sprintf("❌ Invalid action: %s", err.Error()))
				return
			}

			entry := s.UserID + ": " + s.Action + " " + strings.Join(s.Args, " ")
			state.MoveLog = append(state.MoveLog, entry)

			logger.Info("✅ Player move", "userID", s.UserID, "action", s.Action, "args", s.Args)
			sendToAllPlayers(ctx, state.RoomID, state.Players, entry)

			state.HasActed[s.UserID] = true

			handler := ActionRegistry[s.Action]
			handler.Execute(state, s.UserID, s.Args)

			NextTurn(ctx, state)

			if IsBettingRoundOver(state) {
				logger.Info("✅ All players acted. Advancing stage...")
				state.PlayerBets = make(map[string]int64)
				state.CurrentBet = 0
				state.LastRaise = 0
				NextStage(state)

				if state.RoundStage == "ended" || state.RoundStage == "showdown" {
					sendToAllPlayers(ctx, state.RoomID, state.Players, "🏁 Showdown begins...")

					winnerID, combo := EvaluateWinner(state)
					if winnerID != "" {
						sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🥇 Winner: %s | %s", winnerID, combo))
						state.PlayerChips[winnerID] += state.Pot
						sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("💰 %s wins the pot: %d", winnerID, state.Pot))
						state.Pot = 0
					} else {
						sendToAllPlayers(ctx, state.RoomID, state.Players, "😶 No winner")
					}

					state.RoundStage = "ended"
				} else {
					DealBoardCards(state)
					sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🃏 Stage: %s | Board: %v", state.RoundStage, state.BoardCards))
					state.HasActed = make(map[string]bool)
					state.CurrentPlayer = state.PlayerOrder[0]
					sendToPlayer(ctx, state.RoomID, state.CurrentPlayer, "🟢 Your turn")
				}
			} else if state.CurrentPlayer != "" {
				sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🕓 Now playing: %s", state.CurrentPlayer))
				sendToPlayer(ctx, state.RoomID, state.CurrentPlayer, "🟢 Your turn")
				logger.Info("🔁 Turn passed", zap.String("nextPlayer", state.CurrentPlayer))
			}
		})

		selector.AddReceive(terminateChan, func(c workflow.ReceiveChannel, _ bool) {
			var s TerminateGameSignal
			c.Receive(ctx, &s)

			logger.Info("Terminate")

			sendToAllPlayers(ctx, state.RoomID, state.Players, "🚫 Игра остановлена администратором")

			state.GameStarted = false
			state.RoundStage = "ended"

			shouldTerminate = true
		})

		selector.AddFuture(workflow.NewTimer(ctx, tick), func(f workflow.Future) {
			logger.Info("⏰ Tick", "players", len(state.Players))
		})

		selector.Select(ctx)

		if hasHadPlayers && len(state.Players) == 0 {
			logger.Info("⌛ No players in room — waiting 30s before shutdown")
			_ = workflow.Sleep(ctx, 30*time.Second)

			if len(state.Players) == 0 {
				logger.Info("🛑 Room is empty, exiting workflow")
				break
			}
			logger.Info("🔄 Player rejoined, continue loop")
		}
	}
	terminateGame(ctx, state, logger)
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

func GenerateShuffledDeck(ctx workflow.Context) []string {
	suits := []string{"♠", "♥", "♦", "♣"}
	values := []string{"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}

	var deck []string
	for _, suit := range suits {
		for _, value := range values {
			deck = append(deck, value+suit)
		}
	}

	var shuffled []string
	_ = workflow.SideEffect(ctx, func(ctx workflow.Context) interface{} {
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		shuffledCopy := append([]string(nil), deck...) // копия
		for i := range shuffledCopy {
			j := r.Intn(i + 1)
			shuffledCopy[i], shuffledCopy[j] = shuffledCopy[j], shuffledCopy[i]
		}
		return shuffledCopy
	}).Get(&shuffled)

	return shuffled
}

func NextStage(state *RoomState) {
	switch state.RoundStage {
	case "preflop":
		state.RoundStage = "flop"
	case "flop":
		state.RoundStage = "turn"
	case "turn":
		state.RoundStage = "river"
	case "river":
		state.RoundStage = "showdown"
	default:
		state.RoundStage = "ended"
	}
}

func DealBoardCards(state *RoomState) {
	switch state.RoundStage {
	case "flop":
		if len(state.Deck) >= 3 {
			state.BoardCards = append(state.BoardCards, state.Deck[0:3]...)
			state.Deck = state.Deck[3:]
		}
	case "turn", "river":
		if len(state.Deck) >= 1 {
			state.BoardCards = append(state.BoardCards, state.Deck[0])
			state.Deck = state.Deck[1:]
		}
	}
}

func IsBettingRoundOver(state *RoomState) bool {
	activePlayers := 0
	for _, id := range state.PlayerOrder {
		if state.PlayerFolded[id] || state.PlayerAllIn[id] {
			continue
		}
		activePlayers++
		if !state.HasActed[id] {
			return false
		}
	}
	return true
}

func EvaluateWinner(state *RoomState) (string, string) {
	var best HandScore
	var winner string

	for _, playerID := range state.PlayerOrder {
		if state.PlayerFolded[playerID] {
			continue
		}

		cards := append([]string{}, state.PlayerCards[playerID]...)
		cards = append(cards, state.BoardCards...)

		score := EvaluateHand(cards)
		if winner == "" || score.Rank > best.Rank {
			best = score
			winner = playerID
		}
	}

	return winner, best.Desc
}

func sendToPlayer(ctx workflow.Context, roomID, userID, message string) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	_ = workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, userID, message)
}

func dealCards(ctx workflow.Context, state *RoomState, roomID string) []workflow.Future {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	state.Deck = GenerateShuffledDeck(ctx)
	state.PlayerCards = make(map[string][]string)

	var futures []workflow.Future

	for _, playerID := range state.PlayerOrder {
		if len(state.Deck) < 2 {
			break
		}

		cards := []string{state.Deck[0], state.Deck[1]}
		state.PlayerCards[playerID] = cards
		state.Deck = state.Deck[2:]

		eventName := fmt.Sprintf("deal-card-user-%s", playerID)
		state.MoveLog = append(state.MoveLog, eventName)

		msg := fmt.Sprintf("🎴 Your cards: %s, %s", cards[0], cards[1])
		f := workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, playerID, msg)
		futures = append(futures, f)
	}

	sendToAllPlayers(ctx, state.RoomID, state.Players, "🃏 Cards have been dealt")
	return futures
}

type multiFuture struct {
	ctx     workflow.Context
	futures []workflow.Future
}

func (m *multiFuture) Get(ctx workflow.Context, valuePtr interface{}) error {
	for _, f := range m.futures {
		if err := f.Get(ctx, nil); err != nil {
			return err
		}
	}
	return nil
}

func (m *multiFuture) IsReady() bool {
	for _, f := range m.futures {
		if !f.IsReady() {
			return false
		}
	}
	return true
}
