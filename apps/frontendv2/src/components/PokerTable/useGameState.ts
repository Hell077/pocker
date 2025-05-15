import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { API_URL, WS_URL } from '@/env/api'

export interface Player {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  cards?: string[]
  hasFolded?: boolean
}

interface AvailableActionsResponse {
  actions: string[]
}

export interface GameState {
  players: Player[]
  communityCards: string[]
  pot: number
  currentTurn: string | null
  winnerId: string | null
  roomId: string
  status: string
}

interface RawGameState {
  pot?: number
  roomId?: string
  status?: string
  currentTurn?: string | null
  winnerId?: string | null
  communityCards?: string[] | null
  players?: Player[] | Record<string, true> | null
  playerCards?: Record<string, string[] | null>
}

function normalizeGameState(payload: RawGameState): Partial<GameState> {
  return {
    pot: payload.pot ?? 0,
    roomId: payload.roomId ?? '',
    status: payload.status ?? '',
    currentTurn: payload.currentTurn ?? null,
    winnerId: payload.winnerId ?? null,
    communityCards: Array.isArray(payload.communityCards) ? payload.communityCards : [],
  }
}

const getUserId = (): string => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.id || ''
  } catch {
    return ''
  }
}

async function fetchPlayersByIds(ids: string[]): Promise<Player[]> {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`${API_URL}/room/players-by-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ?? '',
    },
    body: JSON.stringify({ user_id: ids }),
  })

  if (!res.ok) {
    console.warn('⚠️ Не удалось загрузить игроков:', await res.text())
    return []
  }

  return res.json()
}

export const parseCardSymbol = (card: string): string => {
  const unicodeToRankMap: Record<string, string> = {
    A: 'A', K: 'K', Q: 'Q', J: 'J', '10': '10',
    '9': '9', '8': '8', '7': '7', '6': '6', '5': '5',
    '4': '4', '3': '3', '2': '2',
  }

  const suitMap: Record<string, string> = {
    '♠': 'S', '♣': 'C', '♦': 'D', '♥': 'H',
  }

  const match = card.match(/^([2-9]|10|[JQKA])([♠♣♦♥])$/)
  if (!match) return 'BACK'

  const [, rankRaw, suitRaw] = match
  const rank = unicodeToRankMap[rankRaw]
  const suit = suitMap[suitRaw]

  return rank && suit ? `${rank}${suit}` : 'BACK'
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    communityCards: [],
    pot: 0,
    currentTurn: null,
    winnerId: null,
    roomId: window.location.pathname.split('/').pop() || '',
    status: '',
  })

  const [myCards, setMyCards] = useState<string[]>([])
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({})
  const requestsRef = useRef(0)
  const MAX_REQUESTS = 3


  const wsRef = useRef<WebSocket | null>(null)
  const lastFetchedTurnRef = useRef<string | null>(null)

  const fetchAvailableActions = async () => {
    if (requestsRef.current >= MAX_REQUESTS) {
      console.warn('⛔ Достигнут лимит запросов available-actions')
      return
    }

    const token = localStorage.getItem('accessToken')
    const userID = getUserId()
    const roomID = gameState.roomId
    if (!token || !userID || !roomID) return

    try {
      requestsRef.current += 1
      const res = await axios.get<AvailableActionsResponse>(
        `${API_URL}/room/available-actions?roomID=${roomID}&userID=${userID}`,
        { headers: { Authorization: token } }
      )
      setAvailableActions(res.data?.actions ?? [])
    } catch (err) {
      console.warn('⚠️ Ошибка получения доступных действий:', err)
      setAvailableActions([])
    }
  }

  const sendReadyStatus = (isReady: boolean) => {
    const user_id = getUserId()
    const room_id = gameState.roomId
    if (!user_id || !room_id || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const message = {
      user_id,
      room_id,
      activity: 'ready',
      args: [isReady.toString()],
    }

    wsRef.current.send(JSON.stringify(message))
  }

  const sendPlayerAction = async (activity: string, args: Record<string, unknown> = {}) => {
    const user_id = getUserId()
    const room_id = gameState.roomId
    if (!user_id || !room_id || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const argsArray: string[] = Object.values(args).map(String)
    const message = { user_id, room_id, activity, args: argsArray }
    wsRef.current.send(JSON.stringify(message))
  }

  useEffect(() => {
    const roomID = gameState.roomId
    const token = localStorage.getItem('accessToken')
    if (!roomID || !token || wsRef.current) return

    const ws = new WebSocket(`${WS_URL}?roomID=${roomID}&token=${token}`)
    wsRef.current = ws

    ws.onmessage = async (event) => {
      requestsRef.current = 0
      const text = event.data


      // 🎴 Личные карты
      if (text.startsWith('🎴 Your cards:')) {
        const rawCards: string[] = text
          .replace('🎴 Your cards:', '')
          .trim()
          .split(',')
          .map((c: string) => c.trim())
        setMyCards(rawCards.map(parseCardSymbol))
        return
      }

      // 🎯 Обновление статуса готовности
      const match = text.match(/^🎯 ([\w-]+) is (Not )?Ready$/)
      if (match) {
        const [, playerId, not] = match
        setReadyStatus(prev => ({ ...prev, [playerId]: !not }))
        return
      }

      // JSON
      if (text.startsWith('{')) {
        try {
          const json = JSON.parse(text)

          if (json.type === 'update-game-state') {
            const userID = getUserId()
            const payload = json.payload
            let players: Player[] = []

            if (Array.isArray(payload.players)) {
              players = payload.players
            } else if (payload.players && typeof payload.players === 'object') {
              const ids = Object.keys(payload.players)
              players = await fetchPlayersByIds(ids)
              setReadyStatus(prev => {
                const updated = { ...prev }
                ids.forEach(id => {
                  if (!(id in updated)) updated[id] = false
                })
                return updated
              })
            }

            if (payload.playerCards?.[userID]) {
              setMyCards(payload.playerCards[userID]?.map(parseCardSymbol) ?? [])
            }

            setGameState(prev => {
              const normalized = normalizeGameState(payload)
              if (normalized.currentTurn && normalized.currentTurn === userID && lastFetchedTurnRef.current !== normalized.currentTurn) {
                lastFetchedTurnRef.current = normalized.currentTurn
                void fetchAvailableActions()
              }
              return { ...prev, ...normalized, players }
            })

            return
          }

          // readyStatus json
          if (
            typeof json === 'object' &&
            json !== null &&
            Object.values(json).every(val => typeof val === 'boolean')
          ) {
            setReadyStatus(prev => ({ ...prev, ...json }))
            return
          }

        } catch (e) {
          console.warn('⚠️ Ошибка парсинга JSON:', e)
        }
      }
    }

    ws.onopen = () => console.log('🟢 WS открыт')
    ws.onclose = () => { wsRef.current = null }
    ws.onerror = (e) => console.error('🛑 WS ошибка', e)

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  return {
    gameState,
    setGameState,
    availableActions,
    fetchAvailableActions,
    sendPlayerAction,
    sendReadyStatus,
    myCards,
    readyStatus,
    setReadyStatus,
  }
}
