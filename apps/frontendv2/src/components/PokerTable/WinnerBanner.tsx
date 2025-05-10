import { AnimatePresence, motion } from 'framer-motion'
import { winnerBannerVariants } from './animations'
import type { Player } from './useGameState'

interface WinnerBannerProps {
    winnerId: string | null
    players: Player[]
}

const WinnerBanner = ({ winnerId, players }: WinnerBannerProps) => {
    const winner = players.find((p) => p.id === winnerId)

    return (
        <AnimatePresence>
            {winner && (
                <motion.div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-400 shadow-2xl border border-yellow-300"
                    variants={winnerBannerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <p className="text-white font-extrabold text-2xl animate-pulse">
                        🎉 {winner.nickname} wins the pot! 🎉
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default WinnerBanner
