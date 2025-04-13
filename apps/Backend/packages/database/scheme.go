package database

import (
	"gorm.io/gorm"
)

// ✅ Пользователь
type Account struct {
	ID         string `gorm:"primaryKey"`
	Password   string
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

// ♠️ Игровая сессия (одна раздача)
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

// 📜 Логи игры
type GameLog struct {
	ID        string `gorm:"primaryKey"`
	GameID    string `gorm:"not null"`
	Message   string
	Timestamp int64
}

// 🏆 Турнир
type Tournament struct {
	ID         string `gorm:"primaryKey"`
	Name       string
	Type       string // Sit&Go / MTT
	Status     string // waiting / started / finished
	BuyIn      int64
	PrizePool  int64
	MaxPlayers int
	CreatedAt  int64
}

// 👥 Участники турнира
type TournamentPlayer struct {
	ID           string  `gorm:"primaryKey"`
	TournamentID string  `gorm:"not null"`
	UserID       string  `gorm:"not null"`
	User         Account `gorm:"foreignKey:UserID;references:ID"`
	IsEliminated bool
	Place        int
}

// 🎬 Реплей раздачи
type Replay struct {
	ID        string `gorm:"primaryKey"`
	GameID    string `gorm:"not null"`
	Data      string // JSON-данные всей раздачи
	CreatedAt int64
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

// 🔔 Уведомления
type Notification struct {
	ID        string  `gorm:"primaryKey"`
	UserID    string  `gorm:"not null"`
	User      Account `gorm:"foreignKey:UserID;references:ID"`
	Title     string
	Message   string
	IsRead    bool
	CreatedAt int64
}
