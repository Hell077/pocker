package database

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	ID         string `gorm:"primaryKey"`
	Password   string
	Email      string `gorm:"unique"`
	AvatarLink string
}

type AccountBalance struct {
	ID             string  `gorm:"primaryKey"`
	UserID         string  `gorm:"not null"`
	User           Account `gorm:"foreignKey:UserID;references:ID"`
	CurrentBalance string  `gorm:"not null"`
}
