package database

import (
	"gorm.io/gorm"
	"time"
)

// ✅ Пользователь
type Account struct {
	ID         string `gorm:"primaryKey"`
	Password   string
	Username   string
	Email      string `gorm:"unique"`
	AvatarLink string
	Role       string `gorm:"default:user"` // user / admin / moderator
	CreatedAt  int64
	UpdatedAt  int64
}

// 💰 Баланс пользователя
type AccountBalance struct {
	ID             string  `gorm:"primaryKey"`
	UserID         string  `gorm:"not null;unique"`
	User           Account `gorm:"foreignKey:UserID;references:ID"`
	CurrentBalance string  `gorm:"not null"`
}

// 🃏 Комната (стол)
type Room struct {
	gorm.Model
	RoomID     string    `gorm:"not null;uniqueIndex"`
	MaxPlayers int       `gorm:"not null"`
	Limits     string    // например "1/2", "5/10"
	Type       string    // "cash" / "sitngo" / "mtt"
	Users      []Account `gorm:"many2many:room_users;"`
	Status     string    `gorm:"default:waiting"` // waiting / playing / finished
}

// 👤 Игрок в сессии
type GamePlayer struct {
	ID         string  `gorm:"primaryKey"`
	GameID     string  `gorm:"not null"`
	UserID     string  `gorm:"not null"`
	User       Account `gorm:"foreignKey:UserID;references:ID"`
	SeatNumber int
	Chips      int64 // сколько фишек у игрока на момент входа
	IsFolded   bool
	IsAllIn    bool
}

type GameSession struct {
	ID        string `gorm:"primaryKey"`
	RoomID    string `gorm:"not null"`
	Round     int
	Pot       int64
	Status    string // preflop / flop / turn / river / showdown / finished
	CreatedAt int64
}

// ▶️ Действия игрока в рамках раздачи
type GameMove struct {
	ID          string `gorm:"primaryKey"`
	GameID      string `gorm:"not null"`
	PlayerID    string `gorm:"not null"`
	Action      string // fold / call / raise / check / allin
	Amount      int64
	RoundNumber int
	CreatedAt   int64
}

// 📊 Рейтинг игрока
type Rating struct {
	ID      string  `gorm:"primaryKey"`
	UserID  string  `gorm:"not null;unique"`
	User    Account `gorm:"foreignKey:UserID;references:ID"`
	ELO     int
	Games   int
	Wins    int
	WinRate float64
}

type Reward struct {
	ID         string    `gorm:"primaryKey"`
	UserID     string    `gorm:"column:user_id"`
	Account    Account   `gorm:"foreignKey:UserID;references:ID"`
	ClaimedAt  time.Time `gorm:"column:claimed_at;type:timestamp"`
	NextReward time.Time `gorm:"column:next;type:timestamp"`
}

type RewardStatistic struct {
	ID           string `gorm:"primaryKey"`
	UserID       string `gorm:"column:user_id"`
	Reward       string `gorm:"column:reward"`
	Counts       int64  `gorm:"column:counts"`
	ClaimedCount int64
}

type CurrentDayReward struct {
	ID    string                 `gorm:"primaryKey"`
	Date  time.Time              `gorm:"not null"`
	Items []CurrentDayRewardItem `gorm:"foreignKey:CurrentDayRewardID;constraint:OnDelete:CASCADE"`
}
type CurrentDayRewardItem struct {
	ID                 string `gorm:"primaryKey"`
	CurrentDayRewardID string `gorm:"not null;index"` // индексируем для быстрого поиска
	Reward             int    `gorm:"not null"`
}
