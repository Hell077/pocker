package service

import (
	"context"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/temporal"
)

func DailyRewardScheduler(c client.Client) error {
	scheduleID := "daily-reward-scheduler"
	workflowID := "daily-reward-workflow"

	spec := client.ScheduleSpec{
		CronExpressions: []string{"0 0 * * *"},
	}

	action := &client.ScheduleWorkflowAction{
		ID:        workflowID,
		Workflow:  "DailyRewardWorkflow",
		TaskQueue: "daily_rewards_queue",
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	}

	options := client.ScheduleOptions{
		ID:     scheduleID,
		Spec:   spec,
		Action: action,
	}

	_, err := c.ScheduleClient().Create(context.Background(), options)
	return err
}
