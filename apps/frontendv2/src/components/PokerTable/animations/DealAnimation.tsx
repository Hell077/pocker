import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Player } from '@/types/types'
import PlayingCard from '../PlayingCard'
import { parseCardSymbol } from '../useGameState'

interface DealAnimationProps {
  players: Player[]
  onComplete?: () => void
}

interface DealtCard {
  playerId: string
  cardIndex: number
  symbol: string
}

export default function DealAnimation({ players, onComplete }: DealAnimationProps) {
  const [dealtCards, setDealtCards] = useState<DealtCard[]>([])

  useEffect(() => {
    console.log('[🎬 DealAnimation] players:', players)
    if (!players.length) return

    const total = players.length * 2
    let i = 0

    const interval = setInterval(() => {
      const player = players[i % players.length]
      const cardIndex = Math.floor(i / players.length)
      const raw = player.cards?.[cardIndex] ?? 'BACK'
      const symbol = parseCardSymbol(raw)

      setDealtCards((prev) => [
        ...prev,
        { playerId: player.id, cardIndex, symbol },
      ])

      i++
      if (i >= total) {
        clearInterval(interval)
        console.log('✅ DealAnimation complete → calling onComplete()')
        onComplete?.()
      }
    }, 400)

    return () => clearInterval(interval)
  }, [players, onComplete])

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {dealtCards.map(({ playerId, cardIndex, symbol }, i) => {
        const index = players.findIndex((p) => p.id === playerId)
        if (index === -1) return null

        const angle = (360 / players.length) * index
        const radius = 300
        const rad = (angle - 90) * (Math.PI / 180)
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius + cardIndex * 15

        return (
          <motion.div
            key={`${playerId}-${cardIndex}-${i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
            animate={{ x, y, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="absolute left-1/2 top-1/2"
          >
            <PlayingCard frontImage={symbol} delay={0} />
          </motion.div>
        )
      })}
    </div>
  )
}
