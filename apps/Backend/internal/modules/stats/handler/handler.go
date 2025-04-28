package handler

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"poker/internal/modules/stats/service"
)

type StatsHandler struct {
	service  *service.StatsService
	temporal client.Client
	logger   *zap.Logger
}

func NewStatsHandler(service *service.StatsService, temporal client.Client, logger *zap.Logger) *StatsHandler {
	return &StatsHandler{
		service:  service,
		temporal: temporal,
		logger:   logger,
	}
}

// Table godoc
// @Summary Получение таблицы рейтингов (Elo-таблица)
// @Description Возвращает список пользователей с их ELO, винрейтом и количеством игр
// @Tags Stats
// @Accept json
// @Produce json
// @Success 200 {object} map[string][]dto.EloTable "Успешный ответ с рейтингом"
// @Failure 500 {object} map[string]string "Ошибка при получении данных"
// @Router /stats/table [get]
func (h *StatsHandler) Table(c *fiber.Ctx) error {
	data, err := h.service.GetRatingTable()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get rating table",
		})
	}

	return c.JSON(fiber.Map{
		"data": data,
	})
}
