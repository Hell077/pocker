import { motion } from 'framer-motion'

import red from '@/assets/chips/red.png'
import blue from '@/assets/chips/blue.png'
import green from '@/assets/chips/green.png'
import black from '@/assets/chips/black.png'
import purple from '@/assets/chips/purple.png'
import gold from '@/assets/chips/gold.png'

const chipImages: Record<string, string> = {
  red,
  blue,
  green,
  black,
  purple,
  gold,
}

interface ChipThrowProps {
  fromX: number
  fromY: number
  delay?: number
  color: keyof typeof chipImages
}

export default function ChipThrowAnimation({ fromX, fromY, delay = 0, color }: ChipThrowProps) {
  const img = chipImages[color] || red

  return (
      <motion.img
          src={img}
          alt=""
          className="absolute w-10 h-10 z-50"
          initial={{ x: fromX, y: fromY, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.4, type: 'spring' }}
      />
  )
}
