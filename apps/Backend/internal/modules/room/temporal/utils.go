package room_temporal

import (
	"context"
	"encoding/json"
	"fmt"
	"go.temporal.io/sdk/log"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"math/rand"
	"poker/internal/modules/room/manager"
	"time"
)

func AllOthersAllInOrFolded(state *RoomState) bool {
	active := 0
	for _, id := range state.PlayerOrder {
		if !state.PlayerFolded[id] && !state.PlayerAllIn[id] {
			active++
		}
	}
	return active == 0
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
		shuffledCopy := append([]string(nil), deck...)
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
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, userID, message).Get(ctx, nil)
	if err != nil {
		workflow.GetLogger(ctx).Error("📛 Failed to send message to player", zap.String("userID", userID), zap.Error(err))
	}
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

type GameStateActivityInput struct {
	RoomID  string
	Players map[string]bool
	State   RoomState
}

func SendGameStateActivity(ctx context.Context, input GameStateActivityInput) error {
	for userID := range input.Players {
		personalPayload := map[string]interface{}{
			"type": "update-game-state",
			"payload": map[string]interface{}{
				"players":        input.State.PlayerOrder,
				"pot":            input.State.Pot,
				"communityCards": input.State.BoardCards,
				"roomId":         input.State.RoomID,
				"status": func() string {
					if input.State.GameStarted {
						return "playing"
					}
					return "waiting"
				}(),
				"currentTurn": input.State.CurrentPlayer,
				"winnerId":    "",
				"playerCards": map[string][]string{
					userID: input.State.PlayerCards[userID],
				},
			},
		}

		jsonData, err := json.Marshal(personalPayload)
		if err != nil {
			return err
		}

		if err := SendMessage(input.RoomID, userID, string(jsonData)); err != nil {
			return fmt.Errorf("failed to send message to %s: %w", userID, err)
		}
	}

	return nil
}

func SendMessage(roomID, userID, message string) error {
	conn, ok := manager.Manager.GetConnection(roomID, userID)
	if !ok {
		return fmt.Errorf("connection not found for user %s", userID)
	}

	return conn.WriteMessage(1, []byte(message))
}

func boolToReady(b bool) string {
	if b {
		return "✅ Ready"
	}
	return "Not Ready"
}

func handleStartGame(ctx workflow.Context, state *RoomState, roomID string, logger log.Logger) {
	if len(state.Players) == 0 {
		logger.Warn("Cannot start game: no players in room")
		sendToAllPlayers(ctx, roomID, state.Players, "⚠️ Game cannot start, no players in room")
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
		logger.Error("PlayerOrder is still empty after init")
		return
	}

	state.CurrentPlayer = state.PlayerOrder[0]

	logger.Info("🎮 Game started", zap.String("firstPlayer", state.CurrentPlayer))
	sendToAllPlayers(ctx, roomID, state.Players, "🎮 Game started!")

	futures := dealCards(ctx, state, roomID)
	for _, f := range futures {
		if err := f.Get(ctx, nil); err != nil {
			logger.Error("Failed to deal cards", zap.Error(err))
		}
	}

	sendToAllPlayers(ctx, roomID, state.Players, fmt.Sprintf("🕓 First turn: %s", state.CurrentPlayer))
	sendToPlayer(ctx, roomID, state.CurrentPlayer, "🟢 Your turn")
}

func SendWinnerPayloadActivity(ctx context.Context, roomID, winnerID string, players map[string]bool, state RoomState) error {
	for userID := range players {
		payload := map[string]interface{}{
			"type": "update-game-state",
			"payload": map[string]interface{}{
				"players":        state.PlayerOrder,
				"pot":            state.Pot,
				"communityCards": state.BoardCards,
				"roomId":         roomID,
				"status":         "ended",
				"currentTurn":    "",
				"winnerId":       winnerID,
				"playerCards": map[string][]string{
					userID: state.PlayerCards[userID],
				},
			},
		}

		jsonData, err := json.Marshal(payload)
		if err != nil {
			return err
		}

		if err := SendMessage(roomID, userID, string(jsonData)); err != nil {
			return err
		}
	}
	return nil
}
