package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func WebSocketUpgradeRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.NewError(fiber.StatusUpgradeRequired, "Upgrade to WebSocket required")
	}
}
