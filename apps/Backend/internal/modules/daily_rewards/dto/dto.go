package dto

import "time"

type DailyReward struct {
	Date   time.Time
	Reward [8]int64
}
