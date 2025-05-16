package activities

import (
	"poker/internal/modules/garbage_collector/service"
)

type GCActivities struct {
	service service.GCService
}

func NewGCActivities(s service.GCService) *GCActivities {
	return &GCActivities{service: s}
}

func (a *GCActivities) StartGC() error {
	return a.service.RemoveOldRooms()
}
