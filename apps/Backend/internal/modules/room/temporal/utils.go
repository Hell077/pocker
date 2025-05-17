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
	"poker/internal/modules/room/repo"
	"poker/packages/database"
	"sort"
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

func EvaluateWinner(state *RoomState) ([]string, HandScore) {
	type playerResult struct {
		ID    string
		Score HandScore
	}

	var results []playerResult

	for _, playerID := range state.PlayerOrder {
		if state.PlayerFolded[playerID] {
			continue
		}
		cards := append([]string{}, state.PlayerCards[playerID]...)
		cards = append(cards, state.BoardCards...)

		score := EvaluateHand(cards)
		results = append(results, playerResult{ID: playerID, Score: score})
	}

	if len(results) == 0 {
		return nil, HandScore{}
	}

	best := results[0]
	winners := []string{best.ID}

	for i := 1; i < len(results); i++ {
		comp := compareHands(results[i].Score, best.Score)
		if comp > 0 {
			best = results[i]
			winners = []string{best.ID}
		} else if comp == 0 {
			winners = append(winners, results[i].ID)
		}
	}

	return winners, best.Score
}

// compareHands возвращает:
//
//	1 если h1 > h2
//	0 если h1 == h2
//
// -1 если h1 < h2
func compareHands(h1, h2 HandScore) int {
	if h1.Rank > h2.Rank {
		return 1
	}
	if h1.Rank < h2.Rank {
		return -1
	}

	getRanks := func(cards []string) []int {
		ranks := make([]int, 0, len(cards))
		for _, card := range cards {
			ranks = append(ranks, rankMap[extractRank(card)])
		}
		sort.Sort(sort.Reverse(sort.IntSlice(ranks)))
		return ranks
	}

	r1 := getRanks(h1.Cards)
	r2 := getRanks(h2.Cards)

	for i := 0; i < len(r1) && i < len(r2); i++ {
		if r1[i] > r2[i] {
			return 1
		} else if r1[i] < r2[i] {
			return -1
		}
	}

	return 0 // абсолютная ничья
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
				"players":        input.State.Players,
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

	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Second,
	}
	actCtx := workflow.WithActivityOptions(ctx, ao)

	for id := range state.Players {
		state.PlayerOrder = append(state.PlayerOrder, id)

		var balance int64
		err := workflow.ExecuteActivity(actCtx, GetPlayerBalanceActivity, id).Get(actCtx, &balance)
		if err != nil {
			logger.Error("❌ Failed to get player balance", zap.String("userID", id), zap.Error(err))
			balance = 0
		}

		state.PlayerChips[id] = balance
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
				announceWinner(ctx, state, id, workflow.GetLogger(ctx))

				state.RoundStage = "ended"
				state.GameStarted = false
				state.CurrentPlayer = ""

				ao := workflow.ActivityOptions{
					StartToCloseTimeout: 5 * time.Second,
				}
				actCtx := workflow.WithActivityOptions(ctx, ao)

				_ = workflow.ExecuteActivity(actCtx, SendWinnerPayloadActivity, state.RoomID, id, state.Players, *state).Get(actCtx, nil)

				// 💰 Зачислить победителю pot
				_ = workflow.ExecuteActivity(actCtx, CreditWinningsActivity, BalanceUpdateInput{
					UserID: id,
					Amount: state.Pot,
				}).Get(actCtx, nil)

				terminateGame(ctx, state, workflow.GetLogger(ctx))
				state.Terminated = true
				return
			}
		}
	}

	state.CurrentPlayer = ""

	if len(canAct) == 0 {
		if state.RoundStage == "river" || state.RoundStage == "showdown" {
			winners, _ := EvaluateWinner(state)
			winner := winners[0]

			announceWinner(ctx, state, winner, workflow.GetLogger(ctx))
			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🏆 %s wins with %s", winner))

			ao := workflow.ActivityOptions{
				StartToCloseTimeout: 5 * time.Second,
			}
			actCtx := workflow.WithActivityOptions(ctx, ao)

			_ = workflow.ExecuteActivity(
				actCtx,
				SendWinnerPayloadActivity,
				state.RoomID,
				winner,
				state.Players,
				*state,
			).Get(actCtx, nil)

			_ = workflow.ExecuteActivity(actCtx, CreditWinningsActivity, BalanceUpdateInput{
				UserID: winner,
				Amount: state.Pot,
			}).Get(actCtx, nil)

			state.RoundStage = "ended"
			state.CurrentPlayer = ""
			state.GameStarted = false
			state.Terminated = true
			terminateGame(ctx, state, workflow.GetLogger(ctx))
			return
		} else {
			NextStage(state)
			DealBoardCards(state)
			sendToAllPlayers(ctx, state.RoomID, state.Players, fmt.Sprintf("🃏 New stage: %s", state.RoundStage))
			NextTurn(ctx, state)
			return
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

func announceWinner(ctx workflow.Context, state *RoomState, winnerID string, logger log.Logger) {
	message := fmt.Sprintf("Победитель: %s!", winnerID)

	sendToAllPlayers(ctx, state.RoomID, state.Players, message)

	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Second * 5,
	}
	actCtx := workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(actCtx, SendWinnerAnnouncementActivity, SendWinnerInput{
		RoomID:   state.RoomID,
		WinnerID: winnerID,
		Message:  message,
		Amount:   state.Pot,
	}).Get(actCtx, nil)

	if err != nil {
		logger.Error("Failed to send winner announcement", zap.Error(err))
	}
}

func updateUserBalance(userID string, delta int64) error {

	fmt.Printf("🔄 Updating balance for user %s by %+d\n", userID, delta)
	return nil
}

func sendToPlayerWithRetries(ctx workflow.Context, roomID, userID, message string, maxAttempts int) bool {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 3 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 1.5,
			MaximumAttempts:    int32(maxAttempts),
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, userID, message).Get(ctx, nil)
	if err != nil {
		workflow.GetLogger(ctx).Error("❌ Could not send message to player after retries", zap.String("userID", userID), zap.Error(err))
		return false
	}
	return true
}
