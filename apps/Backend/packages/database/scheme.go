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
	ID         string     `gorm:"primaryKey"`
	UserID     string     `gorm:"not null;uniqueIndex:uniq_user_reward_date"`
	User       Account    `gorm:"foreignKey:UserID;references:ID" json:"-"`
	RewardDate time.Time  `gorm:"not null;uniqueIndex:uniq_user_reward_date"`
	Amount     int        `gorm:"not null"`
	ClaimedAt  *time.Time `gorm:"default:null"`
}

type RewardStatistic struct {
	ID       string `gorm:"primaryKey"`
	UserID   string `gorm:"column:user_id;not null;index"`
	RewardID string `gorm:"column:reward_id;not null"` // Ссылается на конкретную награду
	Reward   Reward `gorm:"foreignKey:RewardID;references:ID"`
}

type CurrentDayReward struct {
	ID    string                 `gorm:"primaryKey;column:id"`
	Date  time.Time              `gorm:"not null"`
	Items []CurrentDayRewardItem `gorm:"foreignKey:CurrentDayRewardID;constraint:OnDelete:CASCADE"`
}

type CurrentDayRewardItem struct {
	ID                 string `gorm:"primaryKey;column:id"`
	CurrentDayRewardID string `gorm:"not null;index"`
	Reward             int    `gorm:"not null"`
}
