import { motion } from 'framer-motion'
import { cardVariants } from './animations'

interface CardProps {
  symbol: string
}

const Card = ({ symbol }: CardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-10 h-14 bg-white rounded-md shadow-lg flex items-center justify-center text-xl font-bold border border-gray-300"
    >
      {symbol}
    </motion.div>
  )
}

export default Card
