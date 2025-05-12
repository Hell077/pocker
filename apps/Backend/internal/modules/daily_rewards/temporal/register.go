package temporal

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"poker/internal/modules/daily_rewards/repo"
	"poker/internal/modules/daily_rewards/service"
	"poker/internal/modules/daily_rewards/temporal/activities"
	"poker/internal/modules/daily_rewards/temporal/workflow"
	"poker/packages/database"
)

const taskQueue = "daily_rewards_queue"

type Reward struct{}

func (m *Reward) Init(c client.Client) error {
	return service.DailyRewardScheduler(c)
}

func (m *Reward) TaskQueue() string {
	return taskQueue
}

func (m *Reward) Register(w worker.Worker) {
	acts := activities.DailyRewardActivities{Repo: repo.NewRewardRepo(database.DB)}
	w.RegisterActivity(acts.CreateDailyReward)
	w.RegisterWorkflow(workflow.DailyRewardWorkflow)
}

func NewRewardTemporalModule() *Reward {
	return &Reward{}
}

type TemporalModule interface {
	Init(client.Client) error
	TaskQueue() string
	Register(w worker.Worker)
}
