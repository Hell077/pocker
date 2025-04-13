package room_temporal

import (
	"go.temporal.io/sdk/workflow"
	"time"
)

type JoinRoomSignal struct {
	UserID string
}

type LeaveRoomSignal struct {
	UserID string
}

type PlayerMoveSignal struct {
	UserID string
	Move   string
}

type RoomState struct {
	RoomID    string
	Players   map[string]bool
	MoveLog   []string
	StartTime time.Time
}

func StartRoomWorkflow(ctx workflow.Context, roomID string) error {
	logger := workflow.GetLogger(ctx)

	state := &RoomState{
		RoomID:    roomID,
		Players:   make(map[string]bool),
		MoveLog:   []string{},
		StartTime: workflow.Now(ctx),
	}

	// Сигнальные каналы
	joinChan := workflow.GetSignalChannel(ctx, "join-room")
	leaveChan := workflow.GetSignalChannel(ctx, "leave-room")
	moveChan := workflow.GetSignalChannel(ctx, "player-move")

	tick := time.Second * 10

	for {
		selector := workflow.NewSelector(ctx)

		selector.AddReceive(joinChan, func(c workflow.ReceiveChannel, _ bool) {
			var s JoinRoomSignal
			c.Receive(ctx, &s)
			state.Players[s.UserID] = true
			logger.Info("👤 Player joined", "userID", s.UserID)

			// Рассылаем сообщение
			sendToAllPlayers(ctx, state.Players, "Player "+s.UserID+" joined the room")
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
			entry := s.UserID + ": " + s.Move
			state.MoveLog = append(state.MoveLog, entry)

			sendToAllPlayers(ctx, state.Players, entry)
		})

		// Периодический тик
		selector.AddFuture(workflow.NewTimer(ctx, tick), func(f workflow.Future) {
			logger.Info("⏰ Tick", "players", len(state.Players))
		})

		selector.Select(ctx)

		// Условие завершения — если все вышли
		if len(state.Players) == 0 {
			break
		}
	}

	logger.Info("💾 Saving history")

	// Сохраняем историю через Activity
	ao := workflow.ActivityOptions{StartToCloseTimeout: 10 * time.Second}
	ctx = workflow.WithActivityOptions(ctx, ao)
	err := workflow.ExecuteActivity(ctx, SaveGameHistoryActivity, state).Get(ctx, nil)
	if err != nil {
		logger.Error("❌ Failed to save history", "err", err)
	}

	logger.Info("🏁 Room ended")
	return nil
}
