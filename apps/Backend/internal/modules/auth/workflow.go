package auth

import (
	"context"
	"go.temporal.io/sdk/workflow"
	"time"
)

func Workflow(ctx workflow.Context, login string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var token string
	err := workflow.ExecuteActivity(ctx, GenerateToken, login).Get(ctx, &token)
	return token, err
}

func GenerateToken(ctx context.Context, login string) (string, error) {
	// Пример генерации токена
	return "token_for_" + login, nil
}
