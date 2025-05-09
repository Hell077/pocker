import { useState, useEffect } from 'react'

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
}

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        communityCards: [],
        pot: 0,
        currentTurn: null,
        winnerId: null,
    })

    // Заглушка для начального состояния
    useEffect(() => {
        const initialPlayers: Player[] = Array.from({ length: 6 }).map((_, i) => ({
            id: `p${i}`,
            nickname: `Player ${i + 1}`,
            avatarUrl: `/avatars/default${i + 1}.png`,
            chips: Math.floor(Math.random() * 2000) + 500,
        }))

        setGameState({
            players: initialPlayers,
            communityCards: ['🂢', '🂦', '🂮', '🂷', '🃍'],
            pot: 1860,
            currentTurn: 'p2',
            winnerId: null,
        })
    }, [])

    return { gameState, setGameState }
}
