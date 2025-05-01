package handler

import (
	"github.com/gofiber/fiber/v2"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	_ "poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/service"
	_ "poker/packages/database"
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

// GetWheelRewards godoc
// @Summary     Get wheel reward list
// @Description Returns the list of possible rewards in the daily wheel
// @Tags        daily-reward
// @Produce     json
// @Security    BearerAuth
// @Success     200 {array} database.CurrentDayRewardItem
// @Failure     500 {object} fiber.Map
// @Router      /daily-reward/wheel [get]
func (h *DailyReward) GetWheelRewards(c *fiber.Ctx) error {
	rewards, err := h.service.GetWheelRewardList()
	if err != nil {
		return c.JSON(err)
	}
	return c.JSON(rewards)
}

// GetTime godoc
// @Summary     Get time until next daily reward
// @Description Returns the time (in seconds) left until the user can claim the next daily reward.
// @Tags        daily-reward
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} dto.GetTime
// @Failure     500 {object} fiber.Map
// @Router      /daily-reward/cooldown [get]
func (h *DailyReward) GetTime(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	secondsLeft, err := h.service.GetTime(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get cooldown time",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"cooldown_seconds": secondsLeft,
	})
}

// GetReward godoc
// @Summary     Claim daily reward
// @Description Returns the daily reward for the user (creates it if not exists)
// @Tags        daily-reward
// @Produce     json
// @Security    BearerAuth
// @Success     200 {object} database.Reward
// @Failure     500 {object} fiber.Map
// @Router      /daily-reward [post]
func (h *DailyReward) GetReward(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	response, err := h.service.GetReward(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get reward",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
