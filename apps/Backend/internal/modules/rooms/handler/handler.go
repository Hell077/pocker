package handler

import (
    "github.com/gofiber/fiber/v2"
    "pocker/internal/modules/rooms/service"
)

type roomsHandler struct {
    Service *service.RoomsService
}

func NewroomsHandler(s *service.RoomsService) *roomsHandler {
    return &roomsHandler{Service: s}
}

func (h *roomsHandler) RegisterRoutes(r fiber.Router) {
    r.Post("/start", h.Start)
}

func (h *roomsHandler) Start(c *fiber.Ctx) error {
    type Request struct {
        Input string json:"input"
    }
    var req Request
    if err := c.BodyParser(&req); err != nil {
        return fiber.ErrBadRequest
    }

    result, err := h.Service.StartroomsWorkflow(c.Context(), req.Input)
    if err != nil {
        return fiber.NewError(fiber.StatusInternalServerError, err.Error())
    }

    return c.JSON(fiber.Map{"result": result})
}
