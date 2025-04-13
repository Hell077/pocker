package repo

import (
	"gorm.io/gorm"
	"poker/packages/database"
)

type AuthRepo interface {
	CreateAccount(account *database.Account) error
	CreateBalance(balance *database.AccountBalance) error
	GetAccountByEmail(email string) (*database.Account, error)
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
