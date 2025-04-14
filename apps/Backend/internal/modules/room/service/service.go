package service

import (
	"context"
	"github.com/google/uuid"
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
	CreateRoom(ctx context.Context, req dto.CreateRoomRequest) (string, error)
	UpdateRoomStatus(roomID, status string) error
}

func NewRoomService(repo *repo.RoomRepo, logger *zap.Logger, client client.Client) *RoomService {
	return &RoomService{
		repo:   *repo,
		logger: logger,
		client: client,
	}
}

func (s *RoomService) CreateRoom(ctx context.Context, req dto.CreateRoomRequest) (string, error) {
	room := &database.Room{
		RoomID:     uuid.New().String(),
		MaxPlayers: req.MaxPlayers,
		Limits:     req.Limits,
		Type:       req.Type,
		Status:     "waiting",
	}
	RoomID := uuid.New().String()
	if err := s.repo.CreateRoom(room); err != nil {
		return "", err
	}

	_, err := s.client.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        "room_" + RoomID,
		TaskQueue: "room-task-queue",
	}, room_temporal.StartRoomWorkflow, RoomID)

	return RoomID, err
}

func (s *RoomService) UpdateRoomStatus(roomID, status string) error {
	return s.repo.UpdateRoomStatus(roomID, status)
}
