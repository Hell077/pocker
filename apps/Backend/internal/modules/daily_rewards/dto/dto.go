package dto

import (
	"poker/packages/database"
	"time"
)

type DailyReward struct {
	Date   time.Time
	Reward [20]int64
}

type Times struct {
	Second int
	Minute int
	Hour   int
	Day    int
	Month  time.Month
	Year   int
}

type GetTime struct {
	CooldownSeconds int64 `json:"cooldown_seconds"`
}

type RewardResponse struct {
	Reward  database.Reward `json:"reward"`
	Claimed bool            `json:"claimed"`
}
