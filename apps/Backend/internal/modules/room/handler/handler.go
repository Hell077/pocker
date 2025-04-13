package handler

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"go.uber.org/zap"
	"poker/internal/modules/room/dto"
	"poker/internal/modules/room/service"
)

type RoomHandler struct {
	service service.RoomService
	logger  *zap.Logger
}

func NewRoomHandler(s *service.RoomService, logger *zap.Logger) *RoomHandler {
	return &RoomHandler{
		service: *s,
		logger:  logger,
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
func (h *RoomHandler) CreateRoom(c *fiber.Ctx) error {
	var req dto.CreateRoomRequest
	var ctx context.Context
	if err := c.BodyParser(&req); err != nil {
		h.logger.Warn("Invalid request body", zap.Error(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.RoomID == "" || req.MaxPlayers < 2 || req.MaxPlayers > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid room data",
		})
	}

	err := h.service.CreateRoom(ctx, dto.CreateRoomRequest{})
	if err != nil {
		h.logger.Error("Failed to create room", zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create room",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "room created",
		"room_id": req.RoomID,
	})
}

// JoinRoom godoc
// @Summary      Подключение к комнате по WebSocket
// @Description  Устанавливает WebSocket-соединение с покерной комнатой. Требуется `roomId` в URL. После подключения можно обмениваться сообщениями.
// @Tags         Room
// @Produce      plain
// @Param        roomId  path  string  true  "ID комнаты"
// @Success      101  {string}  string  "WebSocket Upgrade"
// @Failure      400  {object}  map[string]string  "Bad Request"
// @Failure      426  {object}  map[string]string  "Upgrade Required"
// @Router       /room/ws/{roomId} [get]
func (h *RoomHandler) JoinRoom(c *websocket.Conn) error {
	defer func() {
		h.logger.Info("🔌 Disconnected", zap.String("remote", c.RemoteAddr().String()))
		c.Close()
	}()

	roomID := c.Params("roomId")
	if roomID == "" {
		h.logger.Warn("Missing roomId param")
		return c.WriteMessage(websocket.TextMessage, []byte("Missing roomId"))
	}

	h.logger.Info("✅ JoinRoom", zap.String("roomId", roomID), zap.String("ip", c.RemoteAddr().String()))

	// 👉 Здесь ты можешь добавить подключение в карту:
	// RoomManager.AddConnection(roomID, c)

	// Приветственное сообщение
	if err := c.WriteMessage(websocket.TextMessage, []byte("Добро пожаловать в комнату: "+roomID)); err != nil {
		h.logger.Error("Write error", zap.Error(err))
		return err
	}

	// Слушаем входящие сообщения от клиента
	for {
		messageType, message, err := c.ReadMessage()
		if err != nil {
			h.logger.Warn("Read error", zap.Error(err))
			break
		}

		h.logger.Info("📩 Message received",
			zap.String("roomId", roomID),
			zap.ByteString("msg", message),
		)

		// Пример эхо-ответа
		if err := c.WriteMessage(messageType, message); err != nil {
			h.logger.Error("Write error", zap.Error(err))
			break
		}
	}

	return nil
}
