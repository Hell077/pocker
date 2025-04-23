package auth

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"os"
	"poker/internal/middleware"
	"poker/internal/modules/auth/handler"
	"poker/internal/modules/auth/repo"
	"poker/internal/modules/auth/service"
)

func RegisterRoutes(router fiber.Router, db *gorm.DB, logger *zap.Logger, temporal client.Client) {
	authRepo := repo.NewAuthRepo(db)
	authService := service.NewAuthService(authRepo, logger)
	authHandler := handler.NewAuthHandler(authService, logger)

	authGroup := router.Group("/auth")

	authGroup.Post("/register", authHandler.Register)
	authGroup.Post("/login", authHandler.Login)

	authGroup.Get("/me", middleware.JWTAuthMiddleware(os.Getenv("JWT_KEY")), authHandler.Me)
}
