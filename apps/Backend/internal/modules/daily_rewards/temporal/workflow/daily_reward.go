package workflow

import (
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"time"
)

func DailyRewardWorkflow(ctx workflow.Context) error {
	activityOpts := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, activityOpts)

	logger := workflow.GetLogger(ctx)
	logger.Info("DailyRewardWorkflow execution started")

	err := workflow.ExecuteActivity(ctx, "CreateDailyReward").Get(ctx, nil)
	if err != nil {
		logger.Error("Failed to execute CreateDailyReward activity", zap.Error(err))
		return err
	}

	logger.Info("DailyRewardWorkflow execution finished successfully")
	return nil
}
