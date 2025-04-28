package dto

import "time"

type DailyReward struct {
	Date   time.Time
	Reward [20]int64
}
