package service

import (
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/repo"
	"poker/packages/database"
)

type AuthService interface {
	GetWheelRewardList() (dto.DailyReward, error)
	GetTime(id string) (database.Reward, error)
}

type DailyRewardService struct {
	repo   repo.DailyRewardRepo
	logger *zap.Logger
}

func NewRewardService(r repo.DailyRewardRepo, logger *zap.Logger) DailyRewardService {
	return DailyRewardService{repo: r, logger: logger}
}

func (h *DailyRewardService) GetWheelRewardList() (dto.DailyReward, error) {
	return h.repo.GetDailyReward()
}

func (h *DailyRewardService) GetTime(id string) (database.Reward, error) {
	return h.repo.GetTime(id)
}

func (h *DailyRewardService) GetReward(reward dto.DailyReward, userid string) (string, error) {
	return "", nil
}

func (h *DailyRewardService) GetRewardStatistic(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{})
}
