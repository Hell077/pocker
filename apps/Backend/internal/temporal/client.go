package temporal

import (
	"fmt"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
)

func NewClient(logger *zap.Logger) client.Client {
	c, err := client.Dial(client.Options{})
	if err != nil {
		logger.Error(fmt.Sprintf("Unable to create Temporal client: %v", err))
	}
	return c
}
