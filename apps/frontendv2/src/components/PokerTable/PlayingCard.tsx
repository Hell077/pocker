import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import backImage from '@public/cards/Back.jpg'

interface Props {
  frontImage: string // ожидаем значение уже в виде '7H', '2C', 'KD' и т.д.
  delay?: number
}

export default function PlayingCard({ frontImage, delay = 0 }: Props) {
  const [flipped, setFlipped] = useState(false)

  const normalized = frontImage.toUpperCase()
  const frontSrc = `/cards/${normalized}.png`
  const isBackOnly = normalized === 'BACK'

  console.log(`[🃏 PlayingCard] rendering card: ${normalized}`)

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <motion.div
      className="w-16 h-24 perspective"
      initial={false}
      animate={{ rotateY: !isBackOnly && flipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <img
        src={backImage}
        alt="Back"
        className="absolute w-full h-full"
        style={{ backfaceVisibility: 'hidden' }}
      />
      {!isBackOnly && (
        <img
          src={frontSrc}
          alt={normalized}
          className="absolute w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          onError={() => console.warn(`❌ Не найден файл: ${frontSrc}`)}
        />
      )}
    </motion.div>
  )
}
