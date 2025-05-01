package daily_reward

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"os"
	"poker/internal/middleware"
	"poker/internal/modules/daily_rewards/handler"
	"poker/internal/modules/daily_rewards/repo"
	"poker/internal/modules/daily_rewards/service"
)

func RegisterRoutes(router fiber.Router, db *gorm.DB, logger *zap.Logger, temporal client.Client) {
	dailyRewardRepo := repo.NewRewardRepo(db)
	dailyRewardService := service.NewRewardService(dailyRewardRepo, logger)
	dailyRewardHandler := handler.NewAuthHandler(dailyRewardService, logger)

	dailyRewardGroup := router.Group("/daily-reward")
	dailyRewardGroup.Use(middleware.JWTAuthMiddleware(os.Getenv("JWT_SECRET")))
	dailyRewardGroup.Post("/", dailyRewardHandler.GetReward)
	dailyRewardGroup.Get("/wheel", dailyRewardHandler.GetWheelRewards)
	dailyRewardGroup.Get("/cooldown", dailyRewardHandler.GetTime)
}
