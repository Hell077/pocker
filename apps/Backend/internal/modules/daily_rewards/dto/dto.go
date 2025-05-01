package dto

import "time"

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
