package repo

import (
	"fmt"
	"gorm.io/gorm"
	"poker/packages/database"
)

type AuthRepo interface {
	CreateAccount(account *database.Account) error
	CreateBalance(balance *database.AccountBalance) error
	GetAccountByEmail(email string) (*database.Account, error)
	MeByID(id string) (database.Account, error)
	UpdateBalance(userID string, newBalance int64) error
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
