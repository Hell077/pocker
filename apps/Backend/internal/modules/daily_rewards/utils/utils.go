package utils

import "math/rand"

func GenerateRandomMultipleOfFifty() int {
	min := 100
	max := 5000
	minDiv := min / 50
	maxDiv := max / 50
	randomDiv := rand.Intn(maxDiv-minDiv+1) + minDiv
	return randomDiv * 50
}
