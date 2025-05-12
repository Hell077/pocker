package room_temporal

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

const taskQueue = "room-task-queue"

type RoomModule struct{}

func (m *RoomModule) Init(client client.Client) error {
	return nil
}

func (m *RoomModule) TaskQueue() string {
	return taskQueue
}

func (m *RoomModule) Register(w worker.Worker) {
	w.RegisterWorkflow(StartRoomWorkflow)
	w.RegisterActivity(SendMessageActivity)
	w.RegisterActivity(SaveGameHistoryActivity)
	w.RegisterActivity(SendCardToUserActivity)
	w.RegisterActivity(SendGameStateActivity)
}

func NewRoomTemporalModule() *RoomModule {
	return &RoomModule{}
}
