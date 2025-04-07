package main

import (
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"pocker/internal/server"
)

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic("unable to initialize zap logger: " + err.Error())
	}
	defer logger.Sync()
	c, err := client.Dial(client.Options{})
	if err != nil {
		logger.Fatal("error creating client", zap.Error(err))
	}
	defer c.Close()

	server.InitDependencies(nil, c)
	logger.Info("🚀 Starting HTTP server...")

	s := server.NewServer()
	s.RegisterModules()
	if err := s.Run(":3000"); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	} else {
		logger.Info("Server stopped gracefully")
	}
}
