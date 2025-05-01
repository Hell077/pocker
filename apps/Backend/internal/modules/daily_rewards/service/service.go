package service

import (
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/repo"
	"poker/packages/database"
)

type DailyRewardServiceI interface {
	GetWheelRewardList() (dto.DailyReward, error)
	GetTime(id string) (database.Reward, error)
	GetReward(reward dto.DailyReward, userid string) (string, error)
}

type DailyRewardService struct {
	repo   repo.DailyRewardRepo
	logger *zap.Logger
}

func NewRewardService(r repo.DailyRewardRepo, logger *zap.Logger) DailyRewardService {
	return DailyRewardService{repo: r, logger: logger}
}

func (s *DailyRewardService) GetWheelRewardList() (dto.DailyReward, error) {
	return s.repo.GetDailyReward()
}

func (s *DailyRewardService) GetTime(id string) (database.Reward, error) {
	return s.repo.GetTime(id)
}

func (s *DailyRewardService) GetReward(reward dto.DailyReward, userid string) (string, error) {
	s.repo.GetDailyReward()
	return "", nil
}

func (s *DailyRewardService) GetRewardStatistic(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{})
}
