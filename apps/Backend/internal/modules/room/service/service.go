package service

import (
	"context"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"poker/internal/modules/room/dto"
	"poker/internal/modules/room/repo"
	room_temporal "poker/internal/modules/room/temporal"
	"poker/packages/database"
)

type RoomService struct {
	repo   repo.RoomRepo
	logger *zap.Logger
	client client.Client
}

type RoomServiceI interface {
	CreateRoom(roomID string, maxPlayers int, limits string, roomType string) error
}

func NewRoomService(repo *repo.RoomRepo, logger *zap.Logger) *RoomService {
	return &RoomService{}
}

func (s *RoomService) CreateRoom(ctx context.Context, req dto.CreateRoomRequest) error {
	room := &database.Room{
		RoomID:     req.RoomID,
		MaxPlayers: req.MaxPlayers,
		Limits:     req.Limits,
		Type:       req.Type,
		Status:     "waiting",
	}

	if err := s.repo.CreateRoom(room); err != nil {
		return err
	}

	_, err := s.client.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        "room_" + req.RoomID,
		TaskQueue: "room-task-queue",
	}, room_temporal.StartRoomWorkflow, req.RoomID)

	return err
}
