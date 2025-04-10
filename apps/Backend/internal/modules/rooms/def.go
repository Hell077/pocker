package rooms

import (
    "go.temporal.io/sdk/worker"
    "go.temporal.io/sdk/workflow"
)

type roomsWorkflowDef struct{}

func (roomsWorkflowDef) Name() string {
    return "rooms"
}

func (roomsWorkflowDef) Register(w worker.Worker) {
    w.RegisterWorkflowWithOptions(Workflow, workflow.RegisterOptions{Name: "rooms"})
    w.RegisterActivity(Activity)
}
