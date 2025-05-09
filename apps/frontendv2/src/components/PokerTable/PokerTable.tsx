import { useGameState } from './useGameState'
import TableBackground from './TableBackground'
import CommunityCards from './CommunityCards'
import Pot from './Pot'
import FancySeat from './FancySeat'
import ActionPanel from './ActionPanel'

const PokerTable = () => {
    const { gameState } = useGameState()
    const seatCount = gameState.players.length

    const radiusX = 370
    const radiusY = 230

    return (
        <div className="relative w-full h-screen bg-black overflow-visible flex items-center justify-center">
            <TableBackground />

            {/* Центр: карты и банк */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative flex flex-col items-center">
                    {/* Карты */}
                    <div className="flex justify-center gap-2">
                        <CommunityCards cards={gameState.communityCards} />
                    </div>

                    {/* Pot под картами, немного левее (через style) */}
                    <div
                        className="absolute top-full mt-2"
                        style={{ left: '50%', transform: 'translate(-54%, 0)' }}
                    >
                        <Pot amount={gameState.pot} />
                    </div>

                </div>
            </div>

            {/* Стол */}
            <div className="w-[900px] h-[500px] rounded-full bg-gradient-to-br from-green-900 to-black border-4 border-green-700 shadow-[0_0_60px_#00ff7f55] relative z-10 flex flex-col items-center justify-center" />

            {/* Игроки */}
            {gameState.players.map((player, index) => {
                const angleDeg = (360 / seatCount) * index - 90
                const angleRad = (angleDeg * Math.PI) / 180
                const x = radiusX * Math.cos(angleRad)
                const y = radiusY * Math.sin(angleRad)

                return (
                    <div
                        key={player.id}
                        className="absolute z-30"
                        style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <FancySeat player={player} isYou={index === 0} index={index} />
                    </div>
                )
            })}

            <ActionPanel />
        </div>
    )
}

export default PokerTable
