import { useEffect, useState } from 'react'
import axios from 'axios'

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

    const fetchAvailableActions = async () => {
        try {
            const roomID = gameState.roomId
            const userID =
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('userId='))?.split('=')[1] || ''

            const token = localStorage.getItem('accessToken')
            if (!roomID || !userID || !token) return

            const res = await axios.get<string[]>(
                `${API_URL}/room/available-actions?roomID=${roomID}&userID=${userID}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setAvailableActions(res.data)
        } catch (err) {
            console.warn('Ошибка получения доступных действий:', err)
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
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('userId='))?.split('=')[1] || ''

            const token = localStorage.getItem('accessToken')
            if (!token || !roomID || !userID) return

            await axios.post(
                `${API_URL}/room/action`,
                { activity, roomID, userID, ...args },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log('✅ Действие отправлено:', activity, args)
        } catch (err) {
            console.error('Ошибка при отправке действия игрока:', err)
        }
    }

    useEffect(() => {
        const roomID = gameState.roomId
        const userID =
            document.cookie
                .split('; ')
                .find((row) => row.startsWith('userId='))?.split('=')[1] || ''

        if (!roomID || !userID) return

        const ws = new WebSocket(
            `${API_URL.replace(/^http/, 'ws')}/room/ws?roomID=${roomID}&userID=${userID}`
        )

        ws.onopen = () => {
            console.log('🟢 WebSocket подключен')
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'update-game-state') {
                    setGameState((prev) => ({
                        ...prev,
                        ...data.payload,
                    }))
                }
            } catch (e) {
                console.warn('Ошибка обработки WS:', e)
            }
        }

        ws.onerror = (e) => {
            console.error('❌ WebSocket ошибка:', e)
        }

        ws.onclose = () => {
            console.log('🔴 WebSocket закрыт')
        }

        return () => {
            ws.close()
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
