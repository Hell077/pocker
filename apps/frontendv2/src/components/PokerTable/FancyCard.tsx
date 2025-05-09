import { motion } from 'framer-motion'

interface Props {
    symbol: string
    revealed: boolean
}

const FancyCard = ({ symbol, revealed }: Props) => {
    return (
        <motion.div
            className="w-[42px] h-[60px] [perspective:600px]"
            animate={{ rotateY: revealed ? 0 : 180 }}
            transition={{ duration: 0.6 }}
        >
            <div className="relative w-full h-full">
                {/* Лицевая сторона */}
                <div className="absolute inset-0 backface-hidden rounded-[6px] shadow-md border border-gray-300 bg-white flex items-center justify-center text-xl font-bold text-black">
                    {symbol}
                </div>

                {/* Рубашка */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[6px] shadow-lg border border-gray-600 bg-gradient-to-br from-[#1f2937] to-[#111827] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                </div>
            </div>
        </motion.div>
    )
}

export default FancyCard
