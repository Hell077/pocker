package temporal

import (
	"context"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"
	"log"
	daily_rewards "poker/internal/modules/daily_rewards/temporal"
	gc_temporal "poker/internal/modules/garbage_collector/temporal"
	room_temporal "poker/internal/modules/room/temporal"
)

func StartWorkersWithContext(ctx context.Context, c client.Client, logger *zap.Logger) {
	modules := []TemporalModule{
		room_temporal.NewRoomTemporalModule(logger),
		daily_rewards.NewRewardTemporalModule(),
		gc_temporal.NewGcTemporalModule(logger),
	}

	var workers []worker.Worker

	for _, module := range modules {
		if err := module.Init(c); err != nil {
			log.Printf("Failed to init module: %v", err)
			continue
		}

		w := worker.New(c, module.TaskQueue(), worker.Options{})
		module.Register(w)
		workers = append(workers, w)

		go func(w worker.Worker, queue string) {
			log.Printf("🛠️  Worker started for queue: %s", queue)
			if err := w.Run(worker.InterruptCh()); err != nil {
				log.Printf("Worker for queue %s exited with error: %v", queue, err)
			}
		}(w, module.TaskQueue())
	}

	<-ctx.Done()
	log.Println("Shutdown signal received. Stopping workers...")

	for _, w := range workers {
		w.Stop()
	}
}
