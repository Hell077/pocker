package repo

import (
	"poker/packages/database"
	"time"

	"gorm.io/gorm"
)

type GCRepo struct {
	db *gorm.DB
}

type GCRepoI interface {
	RemoveOldRooms() (Status, error)
}

type Status string

func NewGCRepo(db *gorm.DB) GCRepo {
	return GCRepo{db: db}
}

func (r *GCRepo) RemoveOldRooms() (Status, error) {
	cutoff := time.Now().Add(-1 * time.Hour)

	result := r.db.
		Model(&database.Room{}).
		Where("status = ? AND created_at <= ?", "waiting", cutoff).
		Update("status", "GC_DELETE")

	if result.Error != nil {
		return "ERROR", result.Error
	}

	if result.RowsAffected > 0 {
		return "ROOMS_DELETED", nil
	}

	return "NO_ROOMS_TO_DELETE", nil
}
