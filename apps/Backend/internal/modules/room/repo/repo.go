package repo

import (
	"fmt"
	"gorm.io/gorm"
	"poker/packages/database"
)

type RoomRepo struct {
	db *gorm.DB
}

type RoomRepoI interface {
	CreateRoom(room *database.Room) error
	UpdateRoomStatus(roomID, status string) error
	GetWaitingRooms() ([]database.Room, error)
}

func NewRoomRepo(db *gorm.DB) *RoomRepo {
	return &RoomRepo{
		db: db,
	}
}

func (r *RoomRepo) CreateRoom(room *database.Room) error {
	return r.db.Create(room).Error
}

func (r *RoomRepo) UpdateRoomStatus(roomID, status string) error {
	result := r.db.Unscoped().
		Model(&database.Room{}).
		Where("room_id = ?", roomID).
		Update("status", status)

	if result.RowsAffected == 0 {
		return fmt.Errorf("no room found to update")
	}
	return result.Error
}

func (r *RoomRepo) GetWaitingRooms() ([]database.Room, error) {
	var rooms []database.Room
	if err := r.db.
		Where("status = ?", "waiting").
		Find(&rooms).Error; err != nil {
		return nil, err
	}
	return rooms, nil
}
