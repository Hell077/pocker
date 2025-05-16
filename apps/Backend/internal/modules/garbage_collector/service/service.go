package service

import (
	"fmt"
	"go.uber.org/zap"
	"poker/internal/modules/garbage_collector/repo"
)

type GCService struct {
	repo   repo.GCRepo
	logger *zap.Logger
}

type GCServiceI interface {
	RemoveOldRooms() error
}

func NewGCService(repo repo.GCRepo, logger *zap.Logger) *GCService {
	return &GCService{
		repo:   repo,
		logger: logger,
	}
}

func (s *GCService) RemoveOldRooms() error {
	s.logger.Info("remove old rooms")
	status, err := s.repo.RemoveOldRooms()
	if err != nil {
		return err
	}
	s.logger.Info(fmt.Sprintf("remove old rooms status: %v", status))
	return nil
}
