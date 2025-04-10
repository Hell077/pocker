package repo

import (
	"gorm.io/gorm"
)

type roomsRepo struct {
	DB *gorm.DB
}

func NewroomsRepo(db *gorm.DB) *roomsRepo {
	return &roomsRepo{DB: db}
}
