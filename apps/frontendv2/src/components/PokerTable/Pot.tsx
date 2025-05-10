import { motion } from 'framer-motion'

interface PotProps {
    amount?: number
}

export default function Pot({ amount = 1860 }: PotProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
        >
            <div className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-yellow-300 shadow-[0_0_15px_#facc15]">
                <p className="text-yellow-300 text-xs uppercase tracking-widest">Bank</p>
                <p className="text-white font-bold text-xl">${amount}</p>
            </div>
        </motion.div>
    )
}
