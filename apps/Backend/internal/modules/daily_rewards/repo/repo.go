package repo

import (
	"gorm.io/gorm"
	"math/rand"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/utils"
	"poker/packages/database"
	"time"
)

type DailyRewardRepoI interface {
	GetDailyReward() (dto.DailyReward, error)
	GetTime(id string) (database.Reward, error)
}
type DailyRewardRepo struct {
	db *gorm.DB
}

func NewRewardRepo(db *gorm.DB) DailyRewardRepo {
	return DailyRewardRepo{db: db}
}

func (d DailyRewardRepo) GetDailyReward() (dto.DailyReward, error) {
	var rewards [8]int64
	rand.New(rand.NewSource(time.Now().UnixNano()))

	for i := 0; i < 8; i++ {
		rewards[i] = int64(utils.GenerateRandomMultipleOfFifty())
	}

	dailyReward := dto.DailyReward{
		Date:   time.Now(),
		Reward: rewards,
	}

	return dailyReward, nil
}

func (d DailyRewardRepo) GetTime(id string) (database.Reward, error) {
	var reward database.Reward
	err := d.db.First(&reward, "id = ?", id).Error
	return reward, err
}
