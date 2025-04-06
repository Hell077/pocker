package auth

import (
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

type AuthWorkflowDef struct{}

func (AuthWorkflowDef) Name() string {
	return "auth"
}

func (AuthWorkflowDef) Register(w worker.Worker) {
	w.RegisterWorkflowWithOptions(Workflow, workflow.RegisterOptions{Name: "auth"})
	w.RegisterActivity(GenerateToken)
}
