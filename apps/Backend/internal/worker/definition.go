package worker

import "go.temporal.io/sdk/worker"

type WorkflowDefinition interface {
	Name() string
	Register(w worker.Worker)
}
