package handler

import (
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"poker/internal/modules/auth/dto"
	"poker/internal/modules/auth/service"
)

type AuthHandler struct {
	service service.AuthService
	logger  *zap.Logger
}

func NewAuthHandler(s service.AuthService, logger *zap.Logger) *AuthHandler {
	return &AuthHandler{
		service: s,
		logger:  logger,
	}
}

// Register godoc
// @Summary Register new user
// @Tags Auth
// @Description Register a new user with email and password
// @Accept json
// @Produce plain
// @Param data body dto.RegisterRequest true "Registration data"
// @Success 200 {string} string "registered"
// @Failure 400 {string} string "invalid input"
// @Failure 500 {string} string "registration failed"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Username string `json:"username"`
	}
	var body req
	if err := c.BodyParser(&body); err != nil {
		h.logger.Error("failed to parse register body", zap.Error(err))
		return c.Status(400).SendString("invalid input")
	}

	err := h.service.Register(body.Email, body.Password, body.Username)
	if err != nil {
		h.logger.Error("registration failed", zap.Error(err))
		return c.Status(500).SendString("registration failed")
	}

	return c.SendString("registered")
}

// Login godoc
// @Summary Login
// @Tags Auth
// @Description Login with email and password, return JWT tokens
// @Accept json
// @Produce json
// @Param data body dto.LoginRequest true "Login credentials"
// @Success 200 {object} dto.LoginResponse
// @Failure 400 {string} string "invalid input"
// @Failure 401 {string} string "unauthorized"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var body req
	if err := c.BodyParser(&body); err != nil {
		h.logger.Error("failed to parse login body", zap.Error(err))
		return c.Status(400).SendString("invalid input")
	}

	access, refresh, err := h.service.Login(body.Email, body.Password)
	if err != nil {
		h.logger.Error("login failed", zap.Error(err))
		return c.Status(401).SendString("unauthorized")
	}

	return c.JSON(fiber.Map{
		"access_token":  access,
		"refresh_token": refresh,
	})
}

// Me godoc
// @Summary Get current user
// @Tags Auth
// @Description Return info about authorized user
// @Success 200 {object} dto.Me
// @Failure 401 {object} map[string]string
// @Router /auth/me [get]
// @Security BearerAuth
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	acc, err := h.service.Me(userID)
	if err != nil {
		return c.Status(401).SendString("unauthorized")
	}
	return c.JSON(dto.Me{
		Email:    acc.Email,
		Id:       userID,
		Username: acc.Username,
	})
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" example:"your_refresh_token_here"`
}

// Refresh godoc
// @Summary Refresh access token
// @Tags Auth
// @Description Generate new access token from refresh token
// @Accept json
// @Produce json
// @Param data body RefreshTokenRequest true "Refresh Token"
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	type req struct {
		RefreshToken string `json:"refresh_token"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		h.logger.Error("failed to parse refresh body", zap.Error(err))
		return c.Status(400).SendString("invalid input")
	}

	access, err := h.service.RefreshToken(body.RefreshToken)
	if err != nil {
		h.logger.Error("token refresh failed", zap.Error(err))
		return c.Status(401).SendString("invalid refresh token")
	}

	return c.JSON(fiber.Map{
		"access_token": access,
	})
}
