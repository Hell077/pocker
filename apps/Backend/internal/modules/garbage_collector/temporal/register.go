package temporal

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"
	"poker/internal/modules/garbage_collector/repo"
	"poker/internal/modules/garbage_collector/service"
	"poker/internal/modules/garbage_collector/temporal/activities"
	"poker/internal/modules/garbage_collector/temporal/workflow"
	"poker/packages/database"
)

const TaskQueue = "GC_QUEUE"

type GC struct {
	service *service.GCService
	logger  *zap.Logger
}

func (m *GC) Init(c client.Client) error {
	if err := service.GcScheduler(c); err != nil {
		return err
	}

	m.service = service.NewGCService(repo.NewGCRepo(database.DB), m.logger)
	return nil
}

func (m *GC) TaskQueue() string {
	return TaskQueue
}

func (m *GC) Register(w worker.Worker) {
	acts := activities.NewGCActivities(*m.service)
	w.RegisterActivity(acts.StartGC)
	w.RegisterWorkflow(workflow.GcWorkflow)
}

func NewGcTemporalModule(logger *zap.Logger) *GC {
	return &GC{
		logger: logger,
	}
}

type TemporalModule interface {
	Init(client.Client) error
	TaskQueue() string
	Register(w worker.Worker)
}
