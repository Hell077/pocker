package repo

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
	"poker/internal/modules/stats/dto"
)

type StatsRepo struct {
	db     *gorm.DB
	logger *zap.Logger
}

type StatsRepoI interface {
	Table() error
}

func NewStatsRepo(db *gorm.DB, logger *zap.Logger) *StatsRepo {
	return &StatsRepo{
		db:     db,
		logger: logger,
	}
}

func (r *StatsRepo) Table() ([]dto.EloTable, error) {
	var eloTables []dto.EloTable

	err := r.db.Table("accounts").
		Select(`
			accounts.username, 
			COALESCE(ratings.games, 0) AS games, 
			COALESCE(ratings.win_rate, 0) AS win_rate, 
			COALESCE(ratings.elo, 0) AS elo`).
		Joins("LEFT JOIN ratings ON ratings.user_id = accounts.id").
		Scan(&eloTables).Error

	if err != nil {
		return nil, err
	}

	return eloTables, nil
}
