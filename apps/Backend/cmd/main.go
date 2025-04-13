package main

import (
	"go.uber.org/zap"
	"log"
	"os"
	"os/exec"
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

	if os.Getenv("ENV") == "production" {
		runMigrations()
	}

	//SetupDB
	database.DbSetup()
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
	port := os.Getenv("BACK_PORT")
	if port == "" {
		port = "3000"
	}
	if err := srv.Run(":" + port); err != nil {
		logger.Fatal("❌ Failed to start server", zap.Error(err))
	}

}

func runMigrations() {

	cmd := exec.Command("atlas", "migrate", "apply", "--env", "production")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = "../packages/"

	log.Println("📦 Applying migrations...")
	if err := cmd.Run(); err != nil {
		log.Fatalf("❌ Failed to apply migrations: %v", err)
	}
	log.Println("✅ Migrations applied")
}
