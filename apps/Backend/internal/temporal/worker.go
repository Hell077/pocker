package temporal

import (
	"go.temporal.io/sdk/client"
	daily_rewards "poker/internal/modules/daily_rewards/temporal"
	room_temporal "poker/internal/modules/room/temporal"
	//"user/internal/modules/user"
)

func StartWorkers(c client.Client) {
	modules := []TemporalModule{
		room_temporal.NewRoomTemporalModule(),
		daily_rewards.NewRewardTemporalModule(),
	}

	StartAllWorkers(c, modules)
}
