package temporal

import (
	"go.temporal.io/sdk/client"
	room_temporal "poker/internal/modules/room/temporal"
	//"user/internal/modules/user"
)

func StartWorkers(c client.Client) {
	modules := []TemporalModule{
		room_temporal.NewRoomTemporalModule(),
	}

	StartAllWorkers(c, modules)
}
