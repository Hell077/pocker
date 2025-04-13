package temporal

import "go.temporal.io/sdk/worker"

type TemporalModule interface {
	Register(worker.Worker)
	TaskQueue() string
}
