package room_temporal

import (
	"go.temporal.io/sdk/worker"
)

const taskQueue = "room-task-queue"

type RoomModule struct{}

func (m *RoomModule) TaskQueue() string {
	return taskQueue
}

func (m *RoomModule) Register(w worker.Worker) {
	w.RegisterWorkflow(StartRoomWorkflow)
	w.RegisterActivity(SendMessageActivity)
	w.RegisterActivity(SaveGameHistoryActivity)

}

func NewRoomTemporalModule() *RoomModule {
	return &RoomModule{}
}
