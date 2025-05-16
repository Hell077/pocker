package service

import (
	"context"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/temporal"
)

func GcScheduler(c client.Client) error {
	scheduleID := "gc-scheduler"
	workflowID := "gc-workflow"

	spec := client.ScheduleSpec{
		CronExpressions: []string{"0 * * * *"},
	}

	action := &client.ScheduleWorkflowAction{
		ID:        workflowID,
		Workflow:  "GcWorkflow",
		TaskQueue: "GC_QUEUE",
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
