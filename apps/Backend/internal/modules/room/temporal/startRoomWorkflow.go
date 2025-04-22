package room_temporal

import (
	"fmt"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"math/rand"
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

type PlayerMoveSignal struct {
	UserID string
	Move   string
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
	PlayerCards   map[string][]string // 🃏 личные карты игрока
	Deck          []string            // 🎴 колода
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

	tick := time.Second * 60

	_ = workflow.SetQueryHandler(ctx, "available-actions", func(userID string) ([]string, error) {
		if _, ok := state.Players[userID]; !ok {
			return nil, fmt.Errorf("player %s not in room", userID)
		}
		return GetAvailableActions(state, userID), nil
	})

	for {
		selector := workflow.NewSelector(ctx)

		selector.AddReceive(startGameChan, func(c workflow.ReceiveChannel, _ bool) {
			var s StartGameSignal
			c.Receive(ctx, &s)

			if len(state.Players) == 0 {
				logger.Warn("❌ Cannot start game: no players in room")
				sendToAllPlayers(ctx, state.Players, "⚠️ Game cannot start, no players in room")
				return
			}

			state.GameStarted = true
			state.PlayerOrder = make([]string, 0)
			state.PlayerChips = make(map[string]int64)
			state.PlayerFolded = make(map[string]bool)
			state.PlayerAllIn = make(map[string]bool)

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
			sendToAllPlayers(ctx, state.Players, "🎮 Game started!")
			sendToAllPlayers(ctx, state.Players, fmt.Sprintf("🕓 First turn: %s", state.CurrentPlayer))
		})

		dealCardsChan := workflow.GetSignalChannel(ctx, "deal-cards")

		selector.AddReceive(dealCardsChan, func(c workflow.ReceiveChannel, _ bool) {
			var s DealCardsSignal
			c.Receive(ctx, &s)

			// 🕐 обязательно!
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

			sendToAllPlayers(ctx, state.Players, "🃏 Cards have been dealt")
		})

		selector.AddReceive(joinChan, func(c workflow.ReceiveChannel, _ bool) {
			var s JoinRoomSignal
			c.Receive(ctx, &s)

			if _, alreadyIn := state.Players[s.UserID]; alreadyIn {
				logger.Warn("🚫 Duplicate user join attempt", "userID", s.UserID)
				sendToAllPlayers(ctx, state.Players, fmt.Sprintf("🚫 Пользователь %s уже в комнате", s.UserID))
				return
			}

			state.Players[s.UserID] = true
			hasHadPlayers = true
			logger.Info("👤 Player joined", "userID", s.UserID)

			sendToAllPlayers(ctx, state.Players, fmt.Sprintf("✅ Player %s joined the room", s.UserID))
		})

		selector.AddReceive(leaveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s LeaveRoomSignal
			c.Receive(ctx, &s)
			delete(state.Players, s.UserID)
			logger.Info("👋 Player left", "userID", s.UserID)

			sendToAllPlayers(ctx, state.Players, "Player "+s.UserID+" left the room")
		})

		selector.AddReceive(moveChan, func(c workflow.ReceiveChannel, _ bool) {
			var s PlayerMoveSignal
			c.Receive(ctx, &s)

			err := ValidatePlayerAction(s.Move, state, s.UserID)
			if err != nil {
				logger.Warn("🚫 Invalid player action",
					"userID", s.UserID,
					"move", s.Move,
					"error", err.Error(),
				)
				sendToAllPlayers(ctx, state.Players, fmt.Sprintf("❌ Invalid action by %s: %s", s.UserID, err.Error()))
				return
			}

			entry := s.UserID + ": " + s.Move
			state.MoveLog = append(state.MoveLog, entry)
			logger.Info("✅ Player move", "userID", s.UserID, "move", s.Move)
			sendToAllPlayers(ctx, state.Players, entry)

			NextTurn(state)
			if state.CurrentPlayer != "" {
				sendToAllPlayers(ctx, state.Players, fmt.Sprintf("🕓 Now playing: %s", state.CurrentPlayer))
				logger.Info("🔁 Turn passed", zap.String("nextPlayer", state.CurrentPlayer))
			} else {
				logger.Info("🏁 Round ended — no next player found")
			}
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

	logger.Info("💾 Saving history")

	ao := workflow.ActivityOptions{StartToCloseTimeout: 10 * time.Second}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, SaveGameHistoryActivity, state).Get(ctx, nil)
	if err != nil {
		logger.Error("❌ Failed to save history", "err", err)
	}

	logger.Info("🏁 Room ended")
	return nil
}

func NextTurn(state *RoomState) {
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

	// ищем следующего, кто не сдался и не all-in
	for i := 1; i <= n; i++ {
		nextIdx := (currentIdx + i) % n
		next := state.PlayerOrder[nextIdx]
		if !state.PlayerFolded[next] && !state.PlayerAllIn[next] {
			state.CurrentPlayer = next
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
