package server

import (
	"github.com/gofiber/fiber/v2"
)

type AppServer struct {
	App *fiber.App
}

func NewServer() *AppServer {
	app := fiber.New()
	return &AppServer{
		App: app,
	}
}

func (s *AppServer) RegisterModules() {
	RegisterRoutes(s.App)
}

func (s *AppServer) Run(addr string) error {
	return s.App.Listen(addr)
}
