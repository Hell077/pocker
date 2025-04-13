package main

import (
	"go.uber.org/zap"
	_ "poker/docs"
	"poker/internal/server"
	"poker/internal/temporal"
	"poker/packages/database"
)

// @title Poker API
// @version 1.0
// @description API documentation for Poker service.
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	//logger
	logger, err := zap.NewProduction()
	if err != nil {
		panic("unable to initialize zap logger: " + err.Error())
	}
	defer logger.Sync()

	//migrations
	database.Migrate()
	logger.Info("✅ Database migrated successfully")

	//Temporal Client
	temporalClient := temporal.NewClient(logger)
	if temporalClient == nil {
		logger.Fatal("❌ Failed to create Temporal client")
	}

	//temporal workers
	go temporal.StartWorkers(temporalClient)
	logger.Info("🌀 Temporal workers started")

	//server
	logger.Info("🚀 Starting HTTP server on :3000")
	srv := server.NewServer(database.DB, temporalClient, logger)
	if err := srv.Run(":3000"); err != nil {
		logger.Fatal("❌ Failed to start server", zap.Error(err))
	}
}
