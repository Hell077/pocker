interface TurnIndicatorProps {
    currentTurnId: string | null
}

const TurnIndicator = ({ currentTurnId }: TurnIndicatorProps) => {
    if (!currentTurnId) return null

    const seatPositions = [
        'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-24 left-8',
        'top-24 left-8',
        'top-4 left-1/2 -translate-x-1/2',
        'top-24 right-8',
        'bottom-24 right-8',
    ]

    const index = Number(currentTurnId.replace('p', '')) // предполагается id формата 'p0', 'p1', ...

    return (
        <div
            className={`absolute w-16 h-16 rounded-full border-4 border-yellow-400 animate-pulse pointer-events-none z-20 ${seatPositions[index]}`}
        />
    )
}

export default TurnIndicator
