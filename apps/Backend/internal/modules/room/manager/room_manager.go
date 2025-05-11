package manager

import (
	"fmt"
	"github.com/gofiber/contrib/websocket"
	"sync"
)

type ConnectionManager struct {
	mu    sync.RWMutex
	rooms map[string]map[string]*websocket.Conn
}

var Manager = NewConnectionManager()

func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		rooms: make(map[string]map[string]*websocket.Conn),
	}
}

func (m *ConnectionManager) Add(roomID, userID string, conn *websocket.Conn) bool {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.rooms[roomID] == nil {
		m.rooms[roomID] = make(map[string]*websocket.Conn)
	}
	if _, exists := m.rooms[roomID][userID]; exists {
		return false
	}

	m.rooms[roomID][userID] = conn
	return true
}

func (m *ConnectionManager) GetUsersInRoom(roomID string) []string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var users []string
	if conns, ok := m.rooms[roomID]; ok {
		for userID := range conns {
			users = append(users, userID)
		}
	}
	return users
}

func (m *ConnectionManager) Remove(roomID, userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.rooms[roomID]; ok {
		delete(m.rooms[roomID], userID)
		if len(m.rooms[roomID]) == 0 {
			delete(m.rooms, roomID)
		}
	}
}

func (m *ConnectionManager) Broadcast(roomID string, message string) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if room, ok := m.rooms[roomID]; ok {
		for _, conn := range room {
			if conn != nil {
				_ = conn.WriteMessage(websocket.TextMessage, []byte(message))
			}
		}
	}
}

func (m *ConnectionManager) SendToUser(roomID, userID, msg string) error {
	conn, ok := m.GetConnection(roomID, userID)
	if !ok {
		return fmt.Errorf("room not found for user %s", userID)
	}
	err := conn.WriteMessage(websocket.TextMessage, []byte(msg))
	return err
}

func (m *ConnectionManager) Get(userID string) *websocket.Conn {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, users := range m.rooms {
		if conn, ok := users[userID]; ok {
			return conn
		}
	}
	return nil
}

func (m *ConnectionManager) GetConnection(roomID, userID string) (*websocket.Conn, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if roomUsers, ok := m.rooms[roomID]; ok {
		conn, exists := roomUsers[userID]
		return conn, exists
	}
	return nil, false
}

func (m *ConnectionManager) GetRoomID(userID string) string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for roomID, users := range m.rooms {
		if _, ok := users[userID]; ok {
			return roomID
		}
	}
	return ""
}

func (m *ConnectionManager) DisconnectAll(roomID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if conns, ok := m.rooms[roomID]; ok {
		for userID, conn := range conns {
			_ = conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Game ended"))
			_ = conn.Close()
			delete(conns, userID)
		}
		delete(m.rooms, roomID)
	}
}
