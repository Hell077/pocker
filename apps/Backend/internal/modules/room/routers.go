package room

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"log"
	"os"
	"poker/internal/middleware"
	"poker/internal/modules/room/handler"
	"poker/internal/modules/room/repo"
	"poker/internal/modules/room/service"
)

func RegisterRoutes(router fiber.Router, db *gorm.DB, logger *zap.Logger, temporal client.Client) {
	roomRepo := repo.NewRoomRepo(db)
	roomService := service.NewRoomService(roomRepo, logger, temporal)
	roomHandler := handler.NewRoomHandler(roomService, logger, temporal)

	roomGroup := router.Group("/room")

	roomGroup.Use(middleware.JWTAuthMiddleware(os.Getenv("JWT_KEY")))
	roomGroup.Get("/list", roomHandler.AvailableRoomList)
	roomGroup.Post("/create-room", roomHandler.CreateRoom)
	roomGroup.Post("/start-game", roomHandler.StartGame)
	roomGroup.Post("/action", roomHandler.PlayerAction)
	roomGroup.Get("/available-actions", roomHandler.AvailableActions)
	roomGroup.Post("/deal-cards", roomHandler.DealCards)
	roomGroup.Post("/terminate-room", roomHandler.TerminateRoom)

	wsGroup := router.Group("/connection")
	wsGroup.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	wsGroup.Get("/ws", websocket.New(func(c *websocket.Conn) {
		if allowed := c.Locals("allowed"); allowed != true {
			log.Println("WebSocket upgrade not allowed")
			_ = c.Close()
			return
		}

		roomID := c.Query("roomID")
		token := c.Query("token")

		if roomID == "" || token == "" {
			_ = c.WriteMessage(websocket.TextMessage, []byte("Missing roomID or token"))
			_ = c.Close()
			return
		}

		claims, err := middleware.ParseJWT(token)
		if err != nil {
			_ = c.WriteMessage(websocket.TextMessage, []byte("Invalid token: "+err.Error()))
			_ = c.Close()
			return
		}
		userID := claims.Subject

		if err := roomHandler.JoinRoom(c, roomID, userID); err != nil {
			_ = c.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()))
			_ = c.Close()
			return
		}

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("WebSocket read error:", err)
				break
			}
			log.Println("📨 WS received:", string(msg))
		}
	}))
}
