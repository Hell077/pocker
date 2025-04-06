package repo

import (
	"context"
	"gorm.io/gorm"
)

type AuthRepo struct {
	DB *gorm.DB
}

func NewAuthRepo(db *gorm.DB) *AuthRepo {
	return &AuthRepo{DB: db}
}

// Пример метода — найти пользователя
func (r *AuthRepo) GetUserByLogin(ctx context.Context, login string) (bool, error) {
	// Здесь должна быть логика поиска пользователя в БД
	// Временно просто возвращаем true
	return true, nil
}
