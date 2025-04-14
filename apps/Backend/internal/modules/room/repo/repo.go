package repo

import (
	"gorm.io/gorm"
	"poker/packages/database"
)

type RoomRepo struct {
	db *gorm.DB
}

type RoomRepoI interface {
	CreateRoom(room *database.Room) error
	UpdateRoomStatus(roomID, status string) error
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
	return r.db.Model(&database.Room{}).Where("room_id = ?", roomID).Update("status", status).Error
}
