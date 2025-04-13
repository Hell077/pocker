package dto

type CreateRoomRequest struct {
	RoomID     string `json:"room_id" validate:"required"`
	MaxPlayers int    `json:"max_players" validate:"required,min=2,max=10"`
	Limits     string `json:"limits"` // Например, "1/2" или "5/10"
	Type       string `json:"type"`   // "cash", "sitngo", "mtt"
}
