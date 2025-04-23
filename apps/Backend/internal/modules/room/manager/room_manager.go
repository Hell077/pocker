package manager

import (
	"github.com/gofiber/websocket/v2"
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

func (m *ConnectionManager) SendToUser(roomID, userID, message string) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if room, ok := m.rooms[roomID]; ok {
		if conn, exists := room[userID]; exists && conn != nil {
			_ = conn.WriteMessage(websocket.TextMessage, []byte(message))
		}
	}
}
