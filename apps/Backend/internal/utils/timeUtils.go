package utils

import (
	"time"
)

type TimeHelper struct {
	currentTime time.Time
}

type TimeI interface {
	Now() time.Time
	ParseTime(string) (time.Time, error)
	AddMinutes(int) time.Time
	MinToSec(n int) int
	HourToMin(n int) int
	MinuteToHour(n int) int
}

func (t *TimeHelper) Now() time.Time {
	return t.currentTime
}

func (t *TimeHelper) ParseTime(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}

func (t *TimeHelper) AddMinutes(n int) time.Time {
	return t.currentTime.Add(time.Duration(n) * time.Minute)
}

func (t *TimeHelper) MinToSec(n int) int {
	return n * 60
}

func (t *TimeHelper) HourToMin(n int) int {
	return n * 60
}

func (t *TimeHelper) MinuteToHour(n int) int {
	return n / 60
}

func (t *TimeHelper) SecToMin(n int) int {
	return n / 60
}
