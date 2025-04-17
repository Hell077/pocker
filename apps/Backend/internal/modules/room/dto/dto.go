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
	UserID   string `json:"userID" validate:"required"`
	Activity string `json:"activity" validate:"required"`
	RoomID   string `json:"roomID" validate:"required"`
}

type StartGameRequest struct {
	RoomID string `json:"roomID" validate:"required"`
}
