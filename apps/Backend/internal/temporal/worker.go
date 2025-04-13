package temporal

import (
	"go.temporal.io/sdk/client"
	//"user/internal/modules/user"
)

func StartWorkers(c client.Client) {
	// Собираем все модули, реализующие TemporalModule
	modules := []TemporalModule{
		//user.NewUserTemporalModule(),
		// auth.NewAuthTemporalModule(),
		// order.NewOrderTemporalModule(),
	}

	// Запускаем все воркеры
	StartAllWorkers(c, modules)
}
