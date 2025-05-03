package dto

import (
	"poker/internal/utils"
)

type CreateRoomRequest struct {
	MaxPlayers int    `json:"max_players" validate:"required,min=2,max=10"`
	Limits     string `json:"limits"` // Например, "1/2" или "5/10"
	Type       string `json:"type"`   // "cash", "sitngo", "mtt"
}

type CreateRoomResponse struct {
	RoomID string           `json:"room_id"`
	Time   utils.TimeHelper `json:"time"`
}

type PlayerActionRequest struct {
	UserID   string   `json:"user_id"`
	RoomID   string   `json:"room_id"`
	Activity string   `json:"activity"`
	Args     []string `json:"args"` // 🆕 добавь это поле
}

type StartGameRequest struct {
	RoomID string `json:"roomID" validate:"required"`
}
