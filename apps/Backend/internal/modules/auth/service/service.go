package service

import (
	"context"
	"go.temporal.io/sdk/client"
)

type AuthService struct {
	Temporal client.Client
}

type AuthTokens struct {
	Access  string
	Refresh string
}

func NewAuthService(c client.Client) *AuthService {
	return &AuthService{Temporal: c}
}

func (s *AuthService) StartAuthWorkflow(ctx context.Context, login string) (string, error) {
	options := client.StartWorkflowOptions{
		ID:        "auth_workflow_" + login,
		TaskQueue: "default-task-queue",
	}

	we, err := s.Temporal.ExecuteWorkflow(ctx, options, "auth", login)
	if err != nil {
		return "", err
	}

	var tokens AuthTokens
	if err := we.Get(ctx, &tokens); err != nil {
		return "", err
	}
	return tokens.Access, nil

}
