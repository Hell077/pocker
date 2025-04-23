package service

import (
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"poker/internal/modules/stats/dto"
	"poker/internal/modules/stats/repo"
)

type StatsServiceI interface {
	GetRatingTable() error
}

type StatsService struct {
	repo     *repo.StatsRepo
	logger   *zap.Logger
	temporal client.Client
}

func NewStatsService(repo *repo.StatsRepo, logger *zap.Logger, temporal client.Client) *StatsService {
	return &StatsService{
		repo:     repo,
		logger:   logger,
		temporal: temporal,
	}
}

func (s *StatsService) GetRatingTable() ([]dto.EloTable, error) {
	data, err := s.repo.Table()
	return data, err
}
