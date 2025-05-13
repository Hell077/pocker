import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { WS_URL } from '@/env/api.ts'
import { API_URL } from '@/env/api.ts'

export interface Player {
    id: string
    nickname: string
    avatarUrl: string
    chips: number
    cards?: string[]
    hasFolded?: boolean
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
        communityCards: Array.isArray(payload.communityCards)
          ? payload.communityCards
          : [],
        players,
    }
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

    const [availableActions, setAvailableActions] = useState<string[]>([])

    const wsRef = useRef<WebSocket | null>(null)
    const joinedRef = useRef(false)

    const fetchAvailableActions = async () => {
        try {
            const roomID = gameState.roomId
            const userID =
              document.cookie.split('; ').find((row) => row.startsWith('userId='))?.split('=')[1] || ''
            const token = localStorage.getItem('accessToken')

            if (!roomID || !userID || !token) return

            const res = await axios.get<string[]>(
              `${API_URL}/room/available-actions?roomID=${roomID}&userID=${userID}`,
              {
                  headers: {
                      Authorization: token,
                  },
              }
            )

            setAvailableActions(res.data)
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
            const roomID = gameState.roomId
            const userID =
              document.cookie.split('; ').find((row) => row.startsWith('userId='))?.split('=')[1] || ''
            const token = localStorage.getItem('accessToken')

            if (!token || !roomID || !userID) return

            await axios.post(
              `${API_URL}/room/action`,
              { activity, roomID, userID, ...args },
              {
                  headers: {
                      Authorization: token,
                  },
              }
            )

            console.log('✅ Действие отправлено:', activity, args)
        } catch (err) {
            console.error('❌ Ошибка при отправке действия игрока:', err)
        }
    }

    useEffect(() => {
        const roomID = gameState.roomId
        const token = localStorage.getItem('accessToken')
        if (!roomID || !token) return
        if (wsRef.current) return

        const wsUrl = `${WS_URL}?roomID=${roomID}&token=${token}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('🟢 WebSocket подключен')
        }

        ws.onmessage = (event) => {
            const text = event.data

            try {
                if (!text.startsWith('{')) {
                    console.warn('📨 Текстовое сообщение от WS:', text)
                    return
                }

                const data = JSON.parse(text)

                if (data.type === 'update-game-state') {
                    const normalized = normalizeGameState(data.payload)
                    setGameState((prev) => ({
                        ...prev,
                        ...normalized,
                    }))
                } else if (data.type === 'error') {
                    console.warn('❌ WS Error:', data.error)
                } else {
                    console.log('📨 WS unknown JSON message:', data)
                }
            } catch (e) {
                console.warn('⚠️ Ошибка обработки WS:', e, 'Raw message:', text)
            }
        }

        ws.onerror = (e) => {
            console.error('❌ WebSocket ошибка:', e)
        }

        ws.onclose = () => {
            console.log('🔴 WebSocket закрыт')
            wsRef.current = null
            joinedRef.current = false
        }

        return () => {
            ws.close()
            wsRef.current = null
            joinedRef.current = false
        }
    }, [gameState.roomId])

    return {
        gameState,
        setGameState,
        availableActions,
        fetchAvailableActions,
        sendPlayerAction,
    }
}
