package workflow

import (
	"go.temporal.io/sdk/workflow"
	"go.uber.org/zap"
	"time"
)

func GcWorkflow(ctx workflow.Context) error {
	activityOpts := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, activityOpts)

	logger := workflow.GetLogger(ctx)
	logger.Info("Gc execution started")

	err := workflow.ExecuteActivity(ctx, "StartGC").Get(ctx, nil)
	if err != nil {
		logger.Error("Failed to execute StartGC activity", zap.Error(err))
		return err
	}

	logger.Info("GC execution finished successfully")
	return nil
}
