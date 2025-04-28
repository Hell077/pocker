package handler

import (
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/service"
)

type DailyReward struct {
	service service.DailyRewardService
	logger  *zap.Logger
}

func NewAuthHandler(s service.DailyRewardService, logger *zap.Logger) *DailyReward {
	return &DailyReward{
		service: s,
		logger:  logger,
	}
}

func (h *DailyReward) GetWheelRewards(c *fiber.Ctx) error {
	rewards, err := h.service.GetWheelRewardList()
	if err != nil {
		return c.JSON(err)
	}
	return c.JSON(rewards)
}

func (h *DailyReward) GetTime(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	time, err := h.service.GetTime(userID)
	if err != nil {
		return c.JSON(err)
	}
	return c.JSON(time)
}

func (h *DailyReward) GetReward(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	c.Params(dto.DailyReward{})
	h.service.GetReward()
}
