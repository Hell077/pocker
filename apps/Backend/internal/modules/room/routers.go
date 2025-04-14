package room

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"poker/internal/middleware"
	"poker/internal/modules/room/handler"
	"poker/internal/modules/room/repo"
	"poker/internal/modules/room/service"
)

func RegisterRoutes(router fiber.Router, db *gorm.DB, logger *zap.Logger, temporal client.Client) {
	RoomRepo := repo.NewRoomRepo(db)
	RoomService := service.NewRoomService(RoomRepo, logger, temporal)
	RoomHandler := handler.NewRoomHandler(RoomService, logger, temporal)

	RoomGroup := router.Group("/room")
	RoomGroup.Post("/create-room", RoomHandler.CreateRoom)
	RoomGroup.Post("/start-game", RoomHandler.StartGame)
	RoomGroup.Post("/action", RoomHandler.PlayerAction)
	RoomGroup.Get("/available-actions", RoomHandler.AvailableActions)

	RoomGroup.Use("/ws", middleware.WebSocketUpgradeRequired())
	RoomGroup.Get("/ws", websocket.New(func(c *websocket.Conn) {
		if err := RoomHandler.JoinRoom(c); err != nil {
			_ = c.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()))
			_ = c.Close()
		}
	}))

}
