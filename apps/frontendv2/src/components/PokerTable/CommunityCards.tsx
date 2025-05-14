import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  cards: string[] 
}

export default function CommunityCards({ cards }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)
    const timeouts: NodeJS.Timeout[] = []

    cards.forEach((_, index) => {
      const delay = index === 0 ? 1000 : index === 3 ? 2800 : 1800 + index * 300
      timeouts.push(
        setTimeout(() => {
          setVisibleCount((prev) => prev + 1)
        }, delay)
      )
    })

    return () => timeouts.forEach(clearTimeout)
  }, [cards])

  return (
    <div className="flex justify-center gap-2 z-40">
      {cards.slice(0, visibleCount).map((card, idx) => (
        <motion.img
          key={idx}
          src={`/PNG/${card}.png`}
          alt={card}
          className="w-16 h-auto drop-shadow-lg rounded-md"
          initial={{ scale: 0.2, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.2 }}
        />
      ))}
    </div>
  )
}
