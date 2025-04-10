package service

import (
	"context"
	"go.temporal.io/sdk/client"
)

type RoomsService struct {
	Temporal client.Client
}

func NewroomsService(c client.Client) *RoomsService {
	return &RoomsService{Temporal: c}
}

func (s *RoomsService) StartroomsWorkflow(ctx context.Context, input string) (string, error) {
	options := client.StartWorkflowOptions{
		ID:        "rooms_workflow_" + input,
		TaskQueue: "default-task-queue",
	}

	we, err := s.Temporal.ExecuteWorkflow(ctx, options, "rooms", input)
	if err != nil {
		return "", err
	}

	var result string
	if err := we.Get(ctx, &result); err != nil {
		return "", err
	}
	return result, nil
}
