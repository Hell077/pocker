package repo

import (
	"errors"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"poker/packages/database"
)

type AuthRepo interface {
	CreateAccount(account *database.Account) error
	CreateBalance(balance *database.AccountBalance) error
	GetAccountByEmail(email string) (*database.Account, error)
	MeByID(id string) (database.Account, error)
	UpdateBalance(userID string, newBalance int64) error
	UpdateElo(userID string, newElo int64, won bool) error
}
type authRepo struct {
	db *gorm.DB
}

func NewAuthRepo(db *gorm.DB) AuthRepo {
	return &authRepo{db: db}
}

func (r *authRepo) CreateAccount(account *database.Account) error {
	return r.db.Create(account).Error
}

func (r *authRepo) CreateBalance(balance *database.AccountBalance) error {
	return r.db.Create(balance).Error
}

func (r *authRepo) GetAccountByEmail(email string) (*database.Account, error) {
	var acc database.Account
	err := r.db.Where("email = ?", email).First(&acc).Error
	if err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *authRepo) MeByID(id string) (database.Account, error) {
	var account database.Account
	err := r.db.Preload("AccountBalance").First(&account, "id = ?", id).Error
	if err != nil {
		return account, err
	}
	return account, nil
}

func (r *authRepo) UpdateBalance(userID string, newBalance int64) error {
	return r.db.Model(&database.AccountBalance{}).
		Where("user_id = ?", userID).
		Update("current_balance", fmt.Sprintf("%d", newBalance)).Error
}

func (r *authRepo) UpdateElo(userID string, deltaElo int64, won bool) error {
	var rating database.Rating

	err := r.db.Where("user_id = ?", userID).First(&rating).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			initialElo := int(deltaElo)
			if initialElo < 0 {
				initialElo = 0
			}

			newRating := database.Rating{
				ID:      uuid.New().String(),
				UserID:  userID,
				Games:   1,
				ELO:     initialElo,
				Wins:    0,
				WinRate: 0,
			}

			if won {
				newRating.Wins = 1
				newRating.WinRate = 100
			}

			return r.db.Create(&newRating).Error
		}
		return err
	}

	rating.Games++
	if won {
		rating.Wins++
	}

	if rating.Games > 0 {
		rating.WinRate = float64(rating.Wins) / float64(rating.Games) * 100
	} else {
		rating.WinRate = 0
	}

	rating.ELO += int(deltaElo)
	if rating.ELO < 0 {
		rating.ELO = 0
	}

	return r.db.Model(&database.Rating{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"elo":      rating.ELO,
			"games":    rating.Games,
			"wins":     rating.Wins,
			"win_rate": rating.WinRate,
		}).Error
}
