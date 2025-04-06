package worker

import (
	"log"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func RunWorker() {
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatal("Unable to create Temporal client:", err)
	}

	w := worker.New(c, "default-task-queue", worker.Options{})

	definitions := []WorkflowDefinition{}

	for _, def := range definitions {
		log.Println("Registering workflow:", def.Name())
		def.Register(w)
	}

	log.Println("Worker started")
	if err := w.Run(worker.InterruptCh()); err != nil {
		log.Fatal("Worker stopped with error:", err)
	}
}
