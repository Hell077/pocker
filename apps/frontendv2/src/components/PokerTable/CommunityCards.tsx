
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PlayingCard from './PlayingCard'

interface Props {
  cards: string[] // Список путей к изображениям карт
}

export default function CommunityCards({ cards }: Props) {
  const [visibleCards, setVisibleCards] = useState<string[]>([])

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    cards.forEach((card, index) => {
      const delay = index === 0 ? 1000 : index === 3 ? 2800 : 1800 + index * 300
      timeouts.push(
        setTimeout(() => {
          setVisibleCards(prev => [...prev, card])
        }, delay)
      )
    })

    return () => timeouts.forEach(clearTimeout)
  }, [cards])

  return (
    <div className="flex justify-center gap-2 z-40">
      {visibleCards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.2, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PlayingCard frontImage={card} delay={200} />
        </motion.div>
      ))}
    </div>
  )
}
