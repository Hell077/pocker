package handler

import (
	"github.com/gofiber/fiber/v2"
	"pocker/internal/modules/auth/service"
)

type AuthHandler struct {
	Service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{
		Service: s,
	}
}

func (h *AuthHandler) RegisterRoutes(r fiber.Router) {
	r.Post("/login", h.Login)
	r.Post("/register", h.Register)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type Request struct {
		Login string `json:"login"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	token, err := h.Service.StartAuthWorkflow(c.Context(), req.Login)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(fiber.Map{
		"access_token":  token,
		"refresh_token": token,
	})
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type Request struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}
	_, err := h.Service.StartAuthWorkflow(c.Context(), req.Login)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{})

}
