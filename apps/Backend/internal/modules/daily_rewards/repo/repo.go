package repo

import (
	"errors"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"poker/internal/modules/daily_rewards/dto"
	"poker/internal/modules/daily_rewards/utils"
	"poker/packages/database"
	"time"
)

type DailyRewardRepoI interface {
	GetDailyReward() (dto.DailyReward, error)
	GetTime(id string) (database.Reward, error)
	CreateReward() error
}
type DailyRewardRepo struct {
	db *gorm.DB
}

func NewRewardRepo(db *gorm.DB) DailyRewardRepo {
	return DailyRewardRepo{db: db}
}

func (r DailyRewardRepo) GetDailyReward() (dto.DailyReward, error) {
	return dto.DailyReward{}, nil
}

func (r DailyRewardRepo) CreateReward() error {
	today := time.Now().Truncate(24 * time.Hour)

	var existing database.CurrentDayReward
	err := r.db.Where("date = ?", today).First(&existing).Error
	if err == nil {
		return nil
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	items := make([]database.CurrentDayRewardItem, 20)
	rewardID := uuid.New().String()

	for i := range items {
		items[i] = database.CurrentDayRewardItem{
			ID:                 uuid.New().String(),
			CurrentDayRewardID: rewardID,
			Reward:             utils.GenerateRandomMultipleOfFifty(),
		}
	}

	reward := database.CurrentDayReward{
		ID:    rewardID,
		Date:  today,
		Items: items,
	}

	if err := r.db.Create(&reward).Error; err != nil {
		return err
	}

	return nil
}

func (r DailyRewardRepo) GetTime(id string) (database.Reward, error) {
	var reward database.Reward
	err := r.db.First(&reward, "id = ?", id).Error
	return reward, err
}
