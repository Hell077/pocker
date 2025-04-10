package rooms

import (
    "context"
    "go.temporal.io/sdk/workflow"
    "time"
)

func Workflow(ctx workflow.Context, input string) (string, error) {
    ao := workflow.ActivityOptions{
        StartToCloseTimeout: 10 * time.Second,
    }
    ctx = workflow.WithActivityOptions(ctx, ao)

    var result string
    err := workflow.ExecuteActivity(ctx, Activity, input).Get(ctx, &result)
    return result, err
}

func Activity(ctx context.Context, input string) (string, error) {
    return "processed_" + input, nil
}
