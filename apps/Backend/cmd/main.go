package main

import (
	"context"
	"go.uber.org/zap"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"poker/internal/server"
	"poker/internal/temporal"
	"poker/packages/database"
	"syscall"
)

// @title Poker API
// @version 1.0
// @description API documentation for Poker service.
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// logger
	logger, err := zap.NewProduction()
	if err != nil {
		panic("unable to initialize zap logger: " + err.Error())
	}
	defer logger.Sync()

	if os.Getenv("ENV") == "production" {
		runMigrations()
	}

	// Setup DB
	database.DbSetup()
	logger.Info("✅ Database migrated successfully")

	// Graceful shutdown setup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Trap OS signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Temporal Client
	temporalClient := temporal.NewClient(logger)
	if temporalClient == nil {
		logger.Fatal("❌ Failed to create Temporal client")
	}
	defer temporalClient.Close() // Graceful close

	go func() {
		logger.Info("🌀 Temporal workers started")
		temporal.StartWorkersWithContext(ctx, temporalClient)
	}()

	// Start HTTP server
	port := os.Getenv("BACK_PORT")
	if port == "" {
		port = "3000"
	}

	logger.Info("🚀 Starting HTTP server on :" + port)
	srv := server.NewServer(database.DB, temporalClient, logger)

	go func() {
		if err := srv.Run(":" + port); err != nil {
			logger.Fatal("❌ Failed to start server", zap.Error(err))
		}
	}()

	<-sigChan
	logger.Info("Shutdown signal received")

	cancel()

	logger.Info("Server shutdown completed")
}

func runMigrations() {
	log.Println("Re-hashing and applying migrations...")

	hashCmd := exec.Command("atlas", "migrate", "hash", "--env", "production")
	hashCmd.Stdout = os.Stdout
	hashCmd.Stderr = os.Stderr
	hashCmd.Dir = "."

	if err := hashCmd.Run(); err != nil {
		log.Fatalf("❌ Failed to hash migrations: %v", err)
	}

	applyCmd := exec.Command("atlas", "migrate", "apply", "--env", "production", "--allow-dirty")
	applyCmd.Stdout = os.Stdout
	applyCmd.Stderr = os.Stderr
	applyCmd.Dir = "."

	if err := applyCmd.Run(); err != nil {
		log.Fatalf("❌ Failed to apply migrations: %v", err)
	}

	log.Println("✅ Migrations hashed and applied successfully")
}
