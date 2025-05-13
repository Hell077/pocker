import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { WS_URL, API_URL } from '@/env/api'

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
    players?: string[] | null
}

function normalizeGameState(payload: RawGameState): Partial<GameState> {
    const players: Player[] = Array.isArray(payload.players)
      ? payload.players.map((id) => ({
          id,
          nickname: 'Игрок',
          avatarUrl: '',
          chips: 1000,
      }))
      : []

    return {
        pot: payload.pot ?? 0,
        roomId: payload.roomId ?? '',
        status: payload.status ?? '',
        currentTurn: payload.currentTurn ?? null,
        winnerId: payload.winnerId ?? null,
        communityCards: Array.isArray(payload.communityCards) ? payload.communityCards : [],
        players,
    }
}

const getUserId = (): string => {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}')?.id || ''
    } catch {
        return ''
    }
}

export const useGameState = (): {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    availableActions: string[]
    fetchAvailableActions: () => Promise<void>
    sendPlayerAction: (activity: string, args?: Record<string, unknown>) => Promise<void>
} => {
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        communityCards: [],
        pot: 0,
        currentTurn: null,
        winnerId: null,
        roomId: window.location.pathname.split('/').pop() || '',
        status: '',
    })

    const [availableActions, setAvailableActions] = useState<string[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const joinedRef = useRef(false)
    const lastFetchedTurnRef = useRef<string | null>(null)
    const lastActionFetchTimeRef = useRef<number>(0)

    const fetchAvailableActions = async () => {
        const now = Date.now()
        const debounceMs = 1000

        if (now - lastActionFetchTimeRef.current < debounceMs) {
            console.log('⏳ Слишком частый запрос действий — пропущено')
            return
        }

        lastActionFetchTimeRef.current = now

        try {
            const token = localStorage.getItem('accessToken')
            const userID = getUserId()
            const roomID = gameState.roomId

            if (!token || !userID || !roomID) return

            console.log('📡 Запрос на доступные действия', { userID, roomID })

            const res = await axios.get<AvailableActionsResponse>(
              `${API_URL}/room/available-actions?roomID=${roomID}&userID=${userID}`,
              { headers: { Authorization: token } }
            )

            const actions = res.data?.actions

            if (Array.isArray(actions) && actions.every((a) => typeof a === 'string')) {
                console.log('✅ Получены действия:', actions)
                setAvailableActions(actions)
            } else {
                console.warn('⚠️ Неверный формат actions:', actions)
                setAvailableActions([])
            }
        } catch (err) {
            console.warn('⚠️ Ошибка получения доступных действий:', err)
            setAvailableActions([])
        }
    }

    const sendPlayerAction = async (
      activity: string,
      args: Record<string, unknown> = {}
    ) => {
        try {
            const user_id = getUserId()
            const room_id = gameState.roomId

            if (!user_id || !room_id || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.warn('⛔ Невозможно отправить действие: WebSocket не готов')
                return
            }

            const argsArray: string[] = Object.values(args).map(String)

            const message = {
                user_id,
                room_id,
                activity,
                args: argsArray,
            }

            wsRef.current.send(JSON.stringify(message))
            console.log('📤 Отправлено действие по WS:', message)
        } catch (err) {
            console.error('❌ Ошибка при отправке действия через WebSocket:', err)
        }
    }


    useEffect(() => {
        const roomID = gameState.roomId
        const token = localStorage.getItem('accessToken')
        if (!roomID || !token || wsRef.current) return

        const wsUrl = `${WS_URL}?roomID=${roomID}&token=${token}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('🟢 [WS] Соединение открыто')
        }

        ws.onmessage = (event) => {
            console.log('📩 [WS] Получено сообщение:', event.data)

            const text = event.data

            try {
                if (!text.startsWith('{')) return
                const data = JSON.parse(text)

                if (data.type === 'update-game-state') {
                    console.log('🔄 [WS] Обновление gameState:', data.payload)

                    const normalized = normalizeGameState(data.payload)
                    const userID = getUserId()

                    setGameState((prev) => {
                        const newTurn = normalized.currentTurn

                        if (
                          newTurn &&
                          newTurn === userID &&
                          lastFetchedTurnRef.current !== newTurn
                        ) {
                            console.log('🎯 Новый ход для пользователя:', newTurn)
                            lastFetchedTurnRef.current = newTurn
                            void fetchAvailableActions()
                        }

                        return {
                            ...prev,
                            ...normalized,
                        }
                    })
                } else if (data.type === 'error') {
                    console.warn('❌ [WS] Ошибка:', data.error)
                } else {
                    console.log('📨 [WS] Неизвестное сообщение:', data)
                }
            } catch (e) {
                console.warn('⚠️ [WS] Ошибка парсинга сообщения:', e)
            }
        }

        ws.onerror = (e) => {
            console.error('🛑 [WS] Ошибка соединения:', e)
        }

        ws.onclose = (e) => {
            console.log(`🔴 [WS] Соединение закрыто, код: ${e.code}, причина: ${e.reason}`)
            wsRef.current = null
            joinedRef.current = false
        }

        return () => {
            ws.close()
            wsRef.current = null
            joinedRef.current = false
        }
    }, []) // только при монтировании

    return {
        gameState,
        setGameState,
        availableActions,
        fetchAvailableActions,
        sendPlayerAction,
    }
}
