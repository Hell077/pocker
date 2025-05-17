package room_temporal

import (
	"context"
	"fmt"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"log"
	authService "poker/internal/modules/auth/service"
	"poker/internal/modules/room/manager"
	"strconv"
	"time"
)

func SendMessageActivity(ctx context.Context, roomID, userID, message string) error {
	return manager.Manager.SendToUser(roomID, userID, message)
}

func SendCardToUserActivity(ctx context.Context, roomID, userID, message string) error {
	manager.Manager.SendToUser(roomID, userID, message)
	log.Printf("📤 WS to %s (%s): %s", userID, roomID, message)
	return nil
}

func SaveGameHistoryActivity(ctx context.Context, state *RoomState) error {
	log.Printf("💾 Saving history for room %s: %+v", state.RoomID, state.MoveLog)
	return nil
}

func sendToAllPlayers(ctx workflow.Context, roomID string, players map[string]bool, message string) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var futures []workflow.Future

	for playerID := range players {
		f := workflow.ExecuteActivity(ctx, SendMessageActivity, roomID, playerID, message)
		futures = append(futures, f)
	}

	for i, f := range futures {
		if err := f.Get(ctx, nil); err != nil {
			workflow.GetLogger(ctx).Error("Failed to send message", "playerID", i, "err", err)
		}
	}
}

func DisconnectAllUsersActivity(ctx context.Context, roomID string) error {

	logger := activity.GetLogger(ctx)
	logger.Info("🔌 DisconnectAllUsersActivity started", zap.String("roomID", roomID))

	defer func() {
		if r := recover(); r != nil {
			logger.Error("🔥 Panic in DisconnectAllUsersActivity", zap.Any("panic", r))
		}
	}()

	users := manager.Manager.GetUsersInRoom(roomID)
	if len(users) == 0 {
		logger.Warn("⚠️ No users found to disconnect", zap.String("roomID", roomID))
		return nil
	}

	manager.Manager.DisconnectAll(roomID)
	logger.Info("✅ All users disconnected", zap.String("roomID", roomID))
	return nil
}

type SendStatusInput struct {
	RoomID  string
	Payload map[string]bool
}

func SendStatusToAllActivity(ctx context.Context, input SendStatusInput) error {
	manager.Manager.BroadcastJSON(input.RoomID, input.Payload)
	return nil
}

type SendWinnerInput struct {
	RoomID   string
	WinnerID string
	Message  string
	Amount   int64
}

func SendWinnerAnnouncementActivity(ctx context.Context, input SendWinnerInput) error {
	payload := map[string]interface{}{
		"type":     "winner",
		"winnerId": input.WinnerID,
		"message":  input.Message,
		"amount":   input.Amount,
	}
	manager.Manager.BroadcastJSON(input.RoomID, payload)
	return nil
}

type BalanceUpdateInput struct {
	UserID string
	Amount int64
}

type RoomActivities struct {
	AuthService authService.AuthService
}

var defaultRoomActivities *RoomActivities // 👈 глобальная прокси

func GetPlayerBalanceActivity(ctx context.Context, userID string) (int64, error) {
	return defaultRoomActivities.GetPlayerBalanceActivity(ctx, userID)
}

func DeductChipsFromBalanceActivity(ctx context.Context, input BalanceUpdateInput) error {
	return defaultRoomActivities.DeductChipsFromBalanceActivity(ctx, input)
}

func CreditWinningsActivity(ctx context.Context, input BalanceUpdateInput) error {
	return defaultRoomActivities.CreditWinningsActivity(ctx, input)
}

func (a *RoomActivities) GetPlayerBalanceActivity(ctx context.Context, userID string) (int64, error) {
	account, err := a.AuthService.Me(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get account: %w", err)
	}

	balance, err := strconv.ParseInt(account.AccountBalance.CurrentBalance, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid balance format: %w", err)
	}

	return balance, nil
}

func (a *RoomActivities) DeductChipsFromBalanceActivity(ctx context.Context, input BalanceUpdateInput) error {
	return a.updateUserBalance(input.UserID, -input.Amount)
}

func (a *RoomActivities) CreditWinningsActivity(ctx context.Context, input BalanceUpdateInput) error {
	return a.updateUserBalance(input.UserID, input.Amount)
}

func (a *RoomActivities) updateUserBalance(userID string, delta int64) error {
	acc, err := a.AuthService.Me(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	balanceInt, err := strconv.ParseInt(acc.AccountBalance.CurrentBalance, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid balance format: %w", err)
	}

	newBalance := balanceInt + delta
	if newBalance < 0 {
		return fmt.Errorf("insufficient chips: current=%d, delta=%d", balanceInt, delta)
	}

	if err := a.AuthService.UpdateBalance(userID, newBalance); err != nil {
		return fmt.Errorf("failed to update balance: %w", err)
	}

	return nil
}
