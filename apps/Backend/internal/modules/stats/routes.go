package stats

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"poker/internal/modules/stats/handler"
	"poker/internal/modules/stats/repo"
	"poker/internal/modules/stats/service"
)

func RegisterRoutes(router fiber.Router, db *gorm.DB, logger *zap.Logger, temporal client.Client) {
	statsRepo := repo.NewStatsRepo(db, logger)
	statsService := service.NewStatsService(statsRepo, logger, temporal)
	statsHandler := handler.NewStatsHandler(statsService, temporal, logger)

	statsGroup := router.Group("/stats")
	statsGroup.Get("/table", statsHandler.Table)
}
