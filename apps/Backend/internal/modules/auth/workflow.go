package auth

import (
	"context"
	"go.temporal.io/sdk/workflow"
	"time"
)

type AuthTokens struct {
	Access  string
	Refresh string
}

func Workflow(ctx workflow.Context, login string) (AuthTokens, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var tokens AuthTokens
	err := workflow.ExecuteActivity(ctx, GenerateTokens, login).Get(ctx, &tokens)
	return tokens, err
}

func GenerateTokens(ctx context.Context, login string) (AuthTokens, error) {
	return AuthTokens{
		Access:  "access_token_for_" + login,
		Refresh: "refresh_token_for_" + login,
	}, nil
}
