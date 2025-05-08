// components/PlayerSeat.tsx
import React from 'react'
import classNames from 'classnames'

interface PlayerSeatProps {
    name: string
    chips: number
    isYou?: boolean
    isDealer?: boolean
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({ name, chips, isYou, isDealer }) => {
    return (
        <div className="flex flex-col items-center">
            <div className={classNames(
                'w-12 h-12 rounded-full flex items-center justify-center border-4 text-xs font-bold',
                {
                    'border-pink-600 text-pink-500': isYou,
                    'border-yellow-400 text-yellow-300': isDealer,
                    'border-white text-white': !isYou && !isDealer
                }
            )}>
                {isYou ? 'YOU' : 'AI'}
            </div>
            <span className="text-sm font-medium text-white mt-1">{name}</span>
            <span className="text-green-400 text-xs">${chips}</span>
        </div>
    )
}

export default PlayerSeat
