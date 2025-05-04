import React from 'react'

interface PlayingCardProps {
    value: string
}

const PlayingCard: React.FC<PlayingCardProps> = ({ value }) => {
    return (
        <div className="w-12 h-16 bg-white text-black text-xl rounded shadow-lg flex items-center justify-center">
            {value}
        </div>
    )
}

export default PlayingCard