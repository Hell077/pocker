package handler

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
	"poker/internal/modules/room/dto"
	"poker/internal/modules/room/manager"
	"poker/internal/modules/room/service"
	room_temporal "poker/internal/modules/room/temporal"
)

type RoomHandler struct {
	service  service.RoomService
	logger   zap.Logger
	temporal client.Client
}

func NewRoomHandler(s *service.RoomService, logger *zap.Logger, temporal client.Client) *RoomHandler {
	return &RoomHandler{
		service:  *s,
		logger:   *logger,
		temporal: temporal,
	}

}

// CreateRoom godoc
// @Summary      Создание комнаты
// @Description  Создаёт новую покерную комнату с заданными параметрами
// @Tags         Room
// @Accept       json
// @Produce      json
// @Param        room  body  dto.CreateRoomRequest  true  "Параметры комнаты"
// @Success      201  {object}  map[string]interface{}  "Комната успешно создана"
// @Failure      400  {object}  map[string]interface{}  "Ошибка валидации или тела запроса"
// @Failure      500  {object}  map[string]interface{}  "Внутренняя ошибка сервера"
// @Router       /room/create-room [post]
// @Security BearerAuth
func (h *RoomHandler) CreateRoom(c *fiber.Ctx) error {
	var req dto.CreateRoomRequest
	var ctx context.Context
	ctx = context.Background()
	if err := c.BodyParser(&req); err != nil {
		h.logger.Warn("Invalid request body", zap.Error(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.MaxPlayers < 2 || req.MaxPlayers > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid room data",
		})
	}

	roomID, err := h.service.CreateRoom(ctx, dto.CreateRoomRequest{})
	if err != nil {
		h.logger.Error("Failed to create room", zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create room",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "room created",
		"room_id": roomID,
	})
}

// JoinRoom godoc
// @Summary      Подключение к комнате по WebSocket
// @Description  Устанавливает WebSocket-соединение с покерной комнатой. Требуется `roomID` как query-параметр.
// @Tags         Room
// @Produce      plain
// @Param        roomID  query  string  true  "ID комнаты"
// @Param        userID  query  string  true  "ID пользователя"
// @Success      101  {string}  string  "WebSocket Upgrade"
// @Failure      400  {object}  map[string]string  "Bad Request"
// @Failure      426  {object}  map[string]string  "Upgrade Required"
// @Router       /room/ws [get]
// @Security BearerAuth
func (h *RoomHandler) JoinRoom(c *websocket.Conn, roomID, userID string) error {

	defer func() {
		h.logger.Info("🔌 Disconnected", zap.String("remote", c.RemoteAddr().String()))
		manager.Manager.Remove(roomID, userID)
		_ = c.Close()
	}()
	if roomID == "" {
		_ = c.WriteMessage(websocket.TextMessage, []byte("Missing roomID"))
		h.logger.Warn("❗ missing required fields", zap.String("roomID", roomID), zap.String("userID", userID))
		return errors.New("missing required fields")
	}

	if !manager.Manager.Add(roomID, userID, c) {
		msg := "❌ This user is already connected to the room"
		h.logger.Warn(msg, zap.String("userID", userID))
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return errors.New("user already connected")
	}

	h.logger.Info("✅ JoinRoom request",
		zap.String("roomID", roomID),
		zap.String("userID", userID),
	)

	err := h.temporal.SignalWorkflow(context.Background(), "room_"+roomID, "", "join-room", room_temporal.JoinRoomSignal{
		UserID: userID,
	})
	if err != nil {
		h.logger.Error("❌ Failed to send join-room signal", zap.Error(err))
		_ = c.WriteMessage(websocket.TextMessage, []byte("Failed to join room"))
		return err
	}

	_ = c.WriteMessage(websocket.TextMessage, []byte("Добро пожаловать в комнату: "+roomID))

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			break
		}

		var req dto.PlayerActionRequest
		if err := json.Unmarshal(message, &req); err != nil {
			h.logger.Warn("❗ Invalid player action JSON", zap.Error(err))
			continue
		}

		h.logger.Info("📩 Player action",
			zap.String("roomID", req.RoomID),
			zap.String("userID", req.UserID),
			zap.String("action", req.Activity),
			zap.Strings("args", req.Args),
		)

		err = h.temporal.SignalWorkflow(context.Background(), "room_"+req.RoomID, "", "player-move", room_temporal.PlayerMoveSignal{
			UserID: req.UserID,
			Action: req.Activity,
			Args:   req.Args,
		})
		if err != nil {
			h.logger.Error("❌ Failed to send player-move", zap.Error(err))
		}
	}

	// При выходе отправляем leave-room
	err = h.temporal.SignalWorkflow(context.Background(), "room_"+roomID, "", "leave-room", room_temporal.LeaveRoomSignal{
		UserID: userID,
	})
	if err != nil {
		h.logger.Error("❌ Failed to send leave-room", zap.Error(err))
	}

	return nil
}

// StartGame godoc
// @Summary Запуск игры
// @Description Меняет статус комнаты на playing
// @Tags Room
// @Accept json
// @Produce json
// @Param body body dto.StartGameRequest true "ID комнаты"
// @Success 200 {object} map[string]string
// @Router /room/start-game [post]
// @Security BearerAuth
func (h *RoomHandler) StartGame(c *fiber.Ctx) error {
	var req dto.StartGameRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if err := h.service.UpdateRoomStatus(req.RoomID, "playing"); err != nil {
		h.logger.Error("failed to update room", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "internal error"})
	}
	err := h.temporal.SignalWorkflow(context.Background(), "room_"+req.RoomID, "", "start-game", room_temporal.StartGameSignal{})
	if err != nil {
		h.logger.Error("❌ Failed to signal start-game", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "temporal error"})
	}
	return c.JSON(fiber.Map{"message": "game started"})
}

// PlayerAction godoc
// @Summary Игровое действие
// @Description Отправка действия игрока в Temporal воркфлоу
// @Tags Room
// @Accept json
// @Produce json
// @Param body body dto.PlayerActionRequest true "Действие игрока"
// @Success 200 {object} map[string]string
// @Router /room/action [post]
// @Security BearerAuth
func (h *RoomHandler) PlayerAction(c *fiber.Ctx) error {
	var req dto.PlayerActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	err := h.temporal.SignalWorkflow(context.Background(), "room_"+req.RoomID, "", "player-move", room_temporal.PlayerMoveSignal{
		UserID: req.UserID,
		Action: req.Activity,
		Args:   req.Args,
	})

	if err != nil {
		h.logger.Error("❌ Failed to send player-move", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "failed to signal workflow"})
	}

	return c.JSON(fiber.Map{"message": "action received"})
}

// AvailableActions godoc
// @Summary Получение доступных действий игрока
// @Description Возвращает список допустимых ходов на текущий момент
// @Tags Room
// @Accept json
// @Produce json
// @Param roomID query string true "ID комнаты"
// @Param userID query string true "ID игрока"
// @Success 200 {object} map[string][]string
// @Router /room/available-actions [get]
// @Security BearerAuth
func (h *RoomHandler) AvailableActions(c *fiber.Ctx) error {
	roomID := c.Query("roomID")
	userID := c.Query("userID")

	if roomID == "" || userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "missing roomID or userID",
		})
	}

	resp, err := h.temporal.QueryWorkflow(context.Background(), "room_"+roomID, "", "available-actions", userID)
	if err != nil {
		h.logger.Error("❌ Failed to query available-actions", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to query workflow",
		})
	}

	var available []string
	if err := resp.Get(&available); err != nil {
		h.logger.Error("❌ Failed to decode query result", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{
			"error": "invalid query result",
		})
	}

	return c.JSON(fiber.Map{
		"actions": available,
	})
}

// DealCards godoc
// @Summary Раздача карт
// @Description Отправляет сигнал в Temporal для раздачи карт
// @Tags Room
// @Accept json
// @Produce json
// @Param body body dto.StartGameRequest true "ID комнаты"
// @Success 200 {object} map[string]string
// @Router /room/deal-cards [post]
// @Security BearerAuth
func (h *RoomHandler) DealCards(c *fiber.Ctx) error {
	var req dto.StartGameRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	err := h.temporal.SignalWorkflow(context.Background(), "room_"+req.RoomID, "", "deal-cards", room_temporal.DealCardsSignal{})
	if err != nil {
		h.logger.Error("❌ Failed to signal deal-cards", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "temporal error"})
	}

	return c.JSON(fiber.Map{"message": "cards dealt"})
}

// AvailableRoomList godoc
// @Summary Получить список доступных комнат
// @Description Возвращает список комнат со статусом "waiting"
// @Tags Room
// @Accept json
// @Produce json
// @Success 200 {object} dto.AvailableRoomListResponse
// @Failure 500 {object} fiber.Map
// @Router /room/list [get]
// @Security BearerAuth
func (h *RoomHandler) AvailableRoomList(c *fiber.Ctx) error {
	rooms, err := h.service.GetRooms()
	if err != nil {
		h.logger.Error("Failed to fetch waiting rooms", zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch rooms",
		})
	}
	return c.JSON(fiber.Map{
		"rooms": rooms,
	})
}

func (h *RoomHandler) TerminateRoom(c *fiber.Ctx) error {
	var req dto.TerminateGameRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if err := h.service.UpdateRoomStatus(req.RoomID, "terminated"); err != nil {
		h.logger.Error("failed to update room", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "internal error"})
	}
	err := h.temporal.SignalWorkflow(context.Background(), "room_"+req.RoomID, "", "terminate-game", room_temporal.TerminateGameSignal{})
	if err != nil {
		h.logger.Error("❌ Failed to signal terminate-game", zap.Error(err))
		return c.Status(500).JSON(fiber.Map{"error": "temporal error"})
	}
	return c.JSON(fiber.Map{"message": "game has terminate successfully"})
}
