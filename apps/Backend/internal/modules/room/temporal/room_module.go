package room_temporal

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"
	"poker/internal/modules/auth/repo"
	authService "poker/internal/modules/auth/service"
	"poker/packages/database"
)

const taskQueue = "room-task-queue"

type RoomModule struct {
	logger     *zap.Logger
	activities *RoomActivities
}

func NewRoomTemporalModule(logger *zap.Logger) *RoomModule {
	return &RoomModule{logger: logger}
}

func (m *RoomModule) Init(c client.Client) error {
	db := database.DB
	authRepo := repo.NewAuthRepo(db)
	authSvc := authService.NewAuthService(authRepo, m.logger)

	m.activities = &RoomActivities{AuthService: authSvc}
	defaultRoomActivities = m.activities
	return nil
}

func (m *RoomModule) TaskQueue() string {
	return taskQueue
}

func (m *RoomModule) Register(w worker.Worker) {
	w.RegisterWorkflow(StartRoomWorkflow)

	// Регистрируем обёртки-функции (а не методы структуры)
	w.RegisterActivity(GetPlayerBalanceActivity)
	w.RegisterActivity(DeductChipsFromBalanceActivity)
	w.RegisterActivity(CreditWinningsActivity)

	// Остальные
	w.RegisterActivity(SendMessageActivity)
	w.RegisterActivity(SaveGameHistoryActivity)
	w.RegisterActivity(SendCardToUserActivity)
	w.RegisterActivity(SendGameStateActivity)
	w.RegisterActivity(SendStatusToAllActivity)
	w.RegisterActivity(DisconnectAllUsersActivity)
	w.RegisterActivity(SendWinnerPayloadActivity)
	w.RegisterActivity(SendWinnerAnnouncementActivity)
}
