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

export const useGameState = (): {
    gameState: GameState
    setGameState: (value: (((prevState: GameState) => GameState) | GameState)) => void
    availableActions: string[]
    fetchAvailableActions: () => Promise<void>
    sendPlayerAction: (activity: string, args?: Record<string, unknown>) => Promise<void>
    sendReadyStatus: (isReady: boolean) => void
    myCards: string[]
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

    const [myCards, setMyCards] = useState<string[]>([])
    const [availableActions, setAvailableActions] = useState<string[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const joinedRef = useRef(false)
    const lastFetchedTurnRef = useRef<string | null>(null)
    const lastActionFetchTimeRef = useRef<number>(0)

    const fetchAvailableActions = async () => {
        const now = Date.now()
        const debounceMs = 1000

        if (now - lastActionFetchTimeRef.current < debounceMs) return
        lastActionFetchTimeRef.current = now

        try {
            const token = localStorage.getItem('accessToken')
            const userID = getUserId()
            const roomID = gameState.roomId
            if (!token || !userID || !roomID) return

            const res = await axios.get<AvailableActionsResponse>(
              `${API_URL}/room/available-actions?roomID=${roomID}&userID=${userID}`,
              { headers: { Authorization: token } }
            )

            const actions = res.data?.actions
            if (Array.isArray(actions)) setAvailableActions(actions)
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

    const sendPlayerAction = async (
      activity: string,
      args: Record<string, unknown> = {}
    ) => {
        const user_id = getUserId()
        const room_id = gameState.roomId
        if (!user_id || !room_id || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

        const argsArray: string[] = Object.values(args).map(String)

        const message = {
            user_id,
            room_id,
            activity,
            args: argsArray,
        }

        wsRef.current.send(JSON.stringify(message))
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

        ws.onmessage = async (event) => {
            const text = event.data
            console.log('📩 [WS] Получено сообщение:', text)

            if (text.startsWith('🎴 Your cards:')) {
                const rawCards = text.replace('🎴 Your cards:', '').trim().split(',').map((c: string) => c.trim())
                const parsed = rawCards.map(parseCardSymbol)
                setMyCards(parsed)
                return
            }

            if (!text.startsWith('{')) return

            try {
                const data = JSON.parse(text)

                if (data.type === 'update-game-state') {
                    const userID = getUserId()
                    const payload = data.payload
                    let players: Player[] = []

                    if (Array.isArray(payload.players)) {
                        players = payload.players
                    } else if (payload.players && typeof payload.players === 'object') {
                        const ids = Object.keys(payload.players)
                        players = await fetchPlayersByIds(ids)
                    }

                    if (payload.playerCards?.[userID]) {
                        const raw = payload.playerCards[userID]
                        const parsed = raw?.map(parseCardSymbol) ?? []
                        setMyCards(parsed)
                    }

                    const normalized = {
                        ...normalizeGameState(payload),
                        players,
                    }

                    setGameState(prev => {
                        const newTurn = normalized.currentTurn
                        if (
                          newTurn &&
                          newTurn === userID &&
                          lastFetchedTurnRef.current !== newTurn
                        ) {
                            lastFetchedTurnRef.current = newTurn
                            void fetchAvailableActions()
                        }

                        return {
                            ...prev,
                            ...normalized,
                        }
                    })
                    return
                }

                if (data.type === 'error') {
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
    }, [])

    return {
        gameState,
        setGameState,
        availableActions,
        fetchAvailableActions,
        sendPlayerAction,
        sendReadyStatus,
        myCards,
    }
}
