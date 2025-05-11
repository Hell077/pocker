package middleware

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func WebSocketUpgradeRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			fmt.Println("✅ Upgrade detected")
			return c.Next()
		}
		fmt.Println("❌ Not a websocket upgrade")
		return fiber.NewError(fiber.StatusUpgradeRequired, "Upgrade to WebSocket required")
	}
}
