package room_temporal

import (
	"context"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"log"
	"poker/internal/modules/room/manager"
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
