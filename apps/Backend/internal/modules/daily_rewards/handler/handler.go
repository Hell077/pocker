package handler

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"poker/internal/modules/daily_rewards/service"
)

type DailyReward struct {
	service  service.DailyRewardService
	logger   *zap.Logger
	temporal client.Client
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
	r, e := h.service.GetWheelRewardList()
	if e != nil {
		return c.JSON(e)
	}
	res, err := h.service.GetReward(r, userID)
	if err != nil {
		return c.JSON(err)
	}
	return c.JSON(res)
}
