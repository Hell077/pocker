
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import backImage from './assets/cards/BACK.svg'

interface Props {
  frontImage: string
  delay?: number
}

export default function PlayingCard({ frontImage, delay = 0 }: Props) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <motion.div
      className="w-16 h-24 perspective"
      initial={false}
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <img
        src={backImage}
        alt="Back"
        className="absolute w-full h-full backface-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      />
      <img
        src={frontImage}
        alt="Front"
        className="absolute w-full h-full backface-hidden"
        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
      />
    </motion.div>
  )
}
