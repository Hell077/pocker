package server

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"gorm.io/gorm"
	"pocker/internal/modules/auth/handler"
	"pocker/internal/modules/auth/service"
)

var (
	db       *gorm.DB
	temporal client.Client
)

func InitDependencies(database *gorm.DB, temporalClient client.Client) {
	db = database
	temporal = temporalClient
}

func RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	{
		authService := service.NewAuthService(temporal)
		authHandler := handler.NewAuthHandler(authService)

		authHandler.RegisterRoutes(api.Group("/auth"))
	}

}
