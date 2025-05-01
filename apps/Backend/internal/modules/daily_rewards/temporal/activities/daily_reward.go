package activities

import "poker/internal/modules/daily_rewards/repo"

type DailyRewardActivities struct {
	Repo repo.DailyRewardRepo
}

func NewDailyRewardActivities(r repo.DailyRewardRepo) *DailyRewardActivities {
	return &DailyRewardActivities{Repo: r}
}

func (a *DailyRewardActivities) CreateDailyReward() error {
	return a.Repo.CreateReward()
}
