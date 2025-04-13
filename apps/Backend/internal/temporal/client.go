package temporal

import (
	"fmt"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"os"
)

func NewClient(logger *zap.Logger) client.Client {
	c, err := client.Dial(client.Options{
		HostPort: os.Getenv("TEMPORAL_ADDRESS"),
	})
	if err != nil {
		logger.Error(fmt.Sprintf("Unable to create Temporal client: %v", err))
	}
	return c
}
