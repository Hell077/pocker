import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Player } from '@/types/types'

interface DealAnimationProps {
  players: Player[]
}

export default function DealAnimation({ players }: DealAnimationProps) {
  const [dealtCards, setDealtCards] = useState<{ playerId: string; cardIndex: number }[]>([])
  const animationTriggered = useRef(false)

  useEffect(() => {
    if (!players.length || animationTriggered.current) return
    animationTriggered.current = true

    const total = players.length * 2
    let i = 0

    const interval = setInterval(() => {
      const player = players[i % players.length]
      const cardIndex = Math.floor(i / players.length)
      setDealtCards(prev => [...prev, { playerId: player.id, cardIndex }])
      i++
      if (i >= total) clearInterval(interval)
    }, 400)

    return () => clearInterval(interval)
  }, [players])

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {dealtCards.map(({ playerId, cardIndex }, i) => {
        const index = players.findIndex(p => p.id === playerId)
        if (index === -1) return null

        const angle = (360 / players.length) * index
        const radius = 300
        const rad = (angle - 90) * (Math.PI / 180)
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius + cardIndex * 15

        return (
          <motion.div
            key={playerId + '-' + cardIndex}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
            animate={{ x, y, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="absolute left-1/2 top-1/2 w-12 h-16 bg-red-600 rounded-md shadow-lg"
          />
        )
      })}
    </div>
  )
}
