package repo

import (
	"errors"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"poker/internal/modules/daily_rewards/utils"
	"poker/packages/database"
	"time"
)

type DailyRewardRepoI interface {
	GetDailyReward() (database.CurrentDayReward, error)
	GetTime(id string) (database.Reward, error)
	GetUserTodayReward(userId string) (database.Reward, error)
	GetAllRewardStatistics(userId string) ([]database.RewardStatistic, error)
	SaveReward(reward database.Reward) error
	CreateReward() error
	SaveRewardWithBalanceAndStatistic(reward database.Reward) error
	CreateTodayRewardIfNotExists() error
}
type DailyRewardRepo struct {
	db *gorm.DB
}

func NewRewardRepo(db *gorm.DB) DailyRewardRepo {
	return DailyRewardRepo{db: db}
}

func (r DailyRewardRepo) GetDailyReward() (database.CurrentDayReward, error) {
	loc := time.FixedZone("GMT-14", 14*60*60)
	today := time.Now().In(loc).Truncate(24 * time.Hour)
	utcDate := today.UTC()

	var reward database.CurrentDayReward
	err := r.db.Preload("Items").Where("date = ?", utcDate).First(&reward).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return database.CurrentDayReward{}, fmt.Errorf("daily reward not found: %w", err)
		}
		return database.CurrentDayReward{}, fmt.Errorf("failed to fetch reward: %w", err)
	}

	return reward, nil
}

func (r DailyRewardRepo) CreateTodayRewardIfNotExists() error {
	loc := time.FixedZone("GMT-14", 14*60*60)
	today := time.Now().In(loc).Truncate(24 * time.Hour)
	utcDate := today.UTC()

	var existing database.CurrentDayReward
	err := r.db.Where("date = ?", utcDate).First(&existing).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to query existing reward: %w", err)
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil // уже есть
	}

	rewardID := uuid.New().String()
	items := make([]database.CurrentDayRewardItem, 20)
	for i := range items {
		items[i] = database.CurrentDayRewardItem{
			ID:                 uuid.New().String(),
			CurrentDayRewardID: rewardID,
			Reward:             utils.GenerateRandomMultipleOfFifty(),
		}
	}

	reward := database.CurrentDayReward{
		ID:    rewardID,
		Date:  utcDate,
		Items: items,
	}

	if err := r.db.Create(&reward).Error; err != nil {
		return fmt.Errorf("failed to create reward: %w", err)
	}

	return nil
}

func (r DailyRewardRepo) CreateReward() error {
	loc := time.FixedZone("GMT-14", 14*60*60)
	today := time.Now().In(loc).Truncate(24 * time.Hour)
	utcDate := today.UTC()

	var existing database.CurrentDayReward
	err := r.db.Where("date = ?", utcDate).First(&existing).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to query reward: %w", err)
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil // уже есть
	}

	rewardID := uuid.New().String()
	items := make([]database.CurrentDayRewardItem, 20)
	for i := range items {
		items[i] = database.CurrentDayRewardItem{
			ID:                 uuid.New().String(),
			CurrentDayRewardID: rewardID,
			Reward:             utils.GenerateRandomMultipleOfFifty(),
		}
	}

	reward := database.CurrentDayReward{
		ID:    rewardID,
		Date:  utcDate,
		Items: items,
	}

	if err := r.db.Create(&reward).Error; err != nil {
		return fmt.Errorf("failed to create reward: %w", err)
	}

	return nil
}

func (r DailyRewardRepo) GetTime(userID string) (database.Reward, error) {
	var reward database.Reward
	today := time.Now().Truncate(24 * time.Hour)

	err := r.db.
		Where("user_id = ? AND reward_date = ?", userID, today).
		First(&reward).Error

	return reward, err
}

func (r DailyRewardRepo) GetUserTodayReward(userId string) (database.Reward, error) {
	var reward database.Reward
	today := time.Now().Truncate(24 * time.Hour)

	err := r.db.
		Where("user_id = ? AND reward_date = ?", userId, today).
		First(&reward).Error
	return reward, err
}

func (r DailyRewardRepo) GetAllRewardStatistics(userId string) ([]database.RewardStatistic, error) {
	var stats []database.RewardStatistic

	err := r.db.
		Preload("Reward").
		Where("user_id = ?", userId).
		Find(&stats).Error

	return stats, err
}

func (r DailyRewardRepo) SaveReward(reward database.Reward) error {
	return r.db.Create(&reward).Error
}

func (r DailyRewardRepo) SaveRewardWithBalanceAndStatistic(reward database.Reward) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&reward).Error; err != nil {
			return err
		}

		res := tx.Exec(`
			UPDATE account_balances
			SET current_balance = (CAST(current_balance AS BIGINT) + ?)::TEXT
			WHERE user_id = ?`, reward.Amount, reward.UserID)

		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return fmt.Errorf("account balance not found for user %s", reward.UserID)
		}

		stat := database.RewardStatistic{
			ID:       uuid.New().String(),
			UserID:   reward.UserID,
			RewardID: reward.ID,
		}
		if err := tx.Create(&stat).Error; err != nil {
			return err
		}

		return nil
	})
}
