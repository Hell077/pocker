package utils

import (
	"math/rand"
	"poker/internal/modules/daily_rewards/dto"
	"time"
)

func GenerateRandomMultipleOfFifty() int {
	min := 100
	max := 5000
	minDiv := min / 100
	maxDiv := max / 100
	randomDiv := rand.Intn(maxDiv-minDiv+1) + minDiv
	return randomDiv * 50
}

func GetDate() (dto.Times, dto.Times) {
	currently := time.Now()
	tomorrow := time.Now().AddDate(0, 0, 1)
	cur, tom := dto.Times{
		Second: currently.Second(),
		Minute: currently.Minute(),
		Hour:   currently.Hour(),
		Day:    currently.Day(),
		Month:  currently.Month(),
		Year:   currently.Year(),
	}, dto.Times{
		Second: tomorrow.Second(),
		Minute: tomorrow.Minute(),
		Hour:   tomorrow.Hour(),
		Day:    tomorrow.Day(),
		Month:  tomorrow.Month(),
		Year:   tomorrow.Year(),
	}
	return cur, tom
}
