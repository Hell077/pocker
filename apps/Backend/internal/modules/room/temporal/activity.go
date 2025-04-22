package room_temporal

import (
	"context"
	"go.temporal.io/sdk/workflow"
	"log"
	"poker/internal/modules/room/manager"
	"time"
)

func SendMessageActivity(ctx context.Context, roomID, userID, message string) error {
	manager.Manager.SendToUser(roomID, userID, message)
	log.Printf("📤 WS sent to %s (%s): %s", userID, roomID, message)
	return nil
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

func sendToAllPlayers(ctx workflow.Context, players map[string]bool, msg string) {
	ao := workflow.ActivityOptions{StartToCloseTimeout: 5 * time.Second}
	ctx = workflow.WithActivityOptions(ctx, ao)

	for userID := range players {
		_ = workflow.ExecuteActivity(ctx, SendMessageActivity, userID, msg)
	}
}
