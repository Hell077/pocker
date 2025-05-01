package service

import (
	"fmt"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"math/rand"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/repo"
	"poker/internal/modules/daily_rewards/utils"
	"poker/packages/database"
	"time"
)

type DailyRewardServiceI interface {
	GetWheelRewardList() (database.CurrentDayReward, error)
	GetTime(userID string) (int64, error)
	GetReward(userID string) (database.Reward, error)
	GetRewardStatistic(userid string) ([]database.RewardStatistic, error)
}

type DailyRewardService struct {
	repo   repo.DailyRewardRepo
	logger *zap.Logger
}

func NewRewardService(r repo.DailyRewardRepo, logger *zap.Logger) DailyRewardService {
	return DailyRewardService{repo: r, logger: logger}
}

func (s *DailyRewardService) GetWheelRewardList() (database.CurrentDayReward, error) {
	return s.repo.GetDailyReward()
}

func (s *DailyRewardService) GetTime(userID string) (int64, error) {
	_, err := s.repo.GetUserTodayReward(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, nil
		}
		return 0, err
	}

	now := time.Now()
	tomorrow := now.Truncate(24 * time.Hour).Add(24 * time.Hour)
	secondsLeft := int64(tomorrow.Sub(now).Seconds())

	return secondsLeft, nil
}

func (s *DailyRewardService) GetReward(userID string) (dto.RewardResponse, error) {
	existing, err := s.repo.GetUserTodayReward(userID)
	if err == nil {
		return dto.RewardResponse{
			Reward:  existing,
			Claimed: true,
		}, nil
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return dto.RewardResponse{}, err
	}

	rewardList, err := s.repo.GetDailyReward()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			s.logger.Info("⚠️ no daily reward found, creating...")
			if err := s.repo.CreateReward(); err != nil {
				s.logger.Error("❌ failed to create daily reward", zap.Error(err))
				return dto.RewardResponse{}, err
			}
			rewardList, err = s.repo.GetDailyReward()
			if err != nil {
				s.logger.Error("❌ failed to retrieve daily reward after creation", zap.Error(err))
				return dto.RewardResponse{}, err
			}
		} else {
			return dto.RewardResponse{}, err
		}
	}

	if len(rewardList.Items) == 0 {
		return dto.RewardResponse{}, fmt.Errorf("no rewards found for today")
	}

	item := rewardList.Items[rand.Intn(len(rewardList.Items))]

	newReward := database.Reward{
		ID:         uuid.New().String(),
		UserID:     userID,
		RewardDate: rewardList.Date,
		Amount:     item.Reward,
		ClaimedAt:  utils.PtrTime(time.Now()),
	}

	if err := s.repo.SaveRewardWithBalanceAndStatistic(newReward); err != nil {
		s.logger.Error("❌ failed to save user reward", zap.Error(err))
		return dto.RewardResponse{}, err
	}

	return dto.RewardResponse{
		Reward:  newReward,
		Claimed: false,
	}, nil
}

func (s *DailyRewardService) GetRewardStatistic(userid string) ([]database.RewardStatistic, error) {
	return s.repo.GetAllRewardStatistics(userid)
}
