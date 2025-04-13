package server

import (
	"github.com/gofiber/fiber/v2"
	fiberSwagger "github.com/swaggo/fiber-swagger"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"poker/internal/modules/auth"
)

type AppServer struct {
	app      *fiber.App
	logger   *zap.Logger
	temporal client.Client
	db       *gorm.DB
}

func NewServer(db *gorm.DB, c client.Client, logger *zap.Logger) *AppServer {
	app := fiber.New()

	app.Use(func(ctx *fiber.Ctx) error {
		logger.Info("📥 incoming request",
			zap.String("method", ctx.Method()),
			zap.String("path", ctx.Path()),
			zap.String("ip", ctx.IP()),
		)
		return ctx.Next()
	})

	return &AppServer{
		app:      app,
		logger:   logger,
		temporal: c,
		db:       db,
	}
}

func (s *AppServer) Run(addr string) error {
	s.RegisterRoutes()
	s.logger.Info("🚀 Starting HTTP server on " + addr)
	if err := s.app.Listen(addr); err != nil {
		s.logger.Error("❌ Failed to start server", zap.Error(err))
		return err
	}
	return nil
}

func (s *AppServer) RegisterRoutes() {
	api := s.app.Group("/api")

	s.app.Get("/swagger/*", fiberSwagger.FiberWrapHandler(func(c *fiberSwagger.Config) {
		c.URL = "/swagger/doc.json"
	}))

	auth.RegisterRoutes(api, s.db, s.logger, s.temporal)

}
