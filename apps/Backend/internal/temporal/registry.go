// internal/temporal/registry.go

package temporal

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"log"
)

func StartAllWorkers(c client.Client, modules []TemporalModule) {
	for _, mod := range modules {
		if err := mod.Init(c); err != nil {
			log.Printf("[!] Init failed for module %s: %v", mod.TaskQueue(), err)
		}

		taskQueue := mod.TaskQueue()
		w := worker.New(c, taskQueue, worker.Options{})

		mod.Register(w)

		go func(m TemporalModule) {
			if err := w.Run(worker.InterruptCh()); err != nil {
				log.Fatalf("Worker for %s failed: %v", m.TaskQueue(), err)
			}
		}(mod)
	}
}
