import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import backImage from '@public/cards/Back.jpg'

interface Props {
    symbol: string
    revealed: boolean
}

export default function FancyCard({ symbol, revealed }: Props) {
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        if (revealed) {
            const timer = setTimeout(() => setFlipped(true), 300)
            return () => clearTimeout(timer)
        }
    }, [revealed])

    const isBackOnly = symbol === 'BACK'

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
              src={`/cards/${symbol}.jpg`}
              alt={symbol}
              className="absolute w-full h-full"
              style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              onError={() => console.warn(`❌ Не найден файл /cards/${symbol}.png`)}
            />
          )}
      </motion.div>
    )
}
