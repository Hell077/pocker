package database

type Account struct {
	ID         string `gorm:"primaryKey"`
	Password   string
	Username   string
	AvatarLink string
}

type AccountBalance struct {
	ID             string  `gorm:"primaryKey"`
	UserID         string  `gorm:"not null"`
	User           Account `gorm:"foreignKey:UserID;references:ID"`
	CurrentBalance string  `gorm:"not null"`
}
