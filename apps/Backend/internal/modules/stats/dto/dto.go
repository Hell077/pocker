package dto

type EloTable struct {
	Username string  `json:"username"`
	Games    int     `json:"games"`
	WinRate  float64 `json:"win_rate"`
	ELO      int     `json:"elo"`
}
