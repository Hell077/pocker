package main

import (
	"go.uber.org/zap"
	"pocker/internal/server"
)

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic("unable to initialize zap logger: " + err.Error())
	}
	defer logger.Sync()

	logger.Info("🚀 Starting HTTP server...")

	s := server.NewServer()

	if err := s.Run(":3000"); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	} else {
		logger.Info("Server stopped gracefully")
	}
}
