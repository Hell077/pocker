import { useGameState } from './useGameState'
import TableBackground from './TableBackground'
import CommunityCards from './CommunityCards'
import Pot from './Pot'
import FancySeat from './FancySeat'
import ActionPanel from './ActionPanel'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PokerTable = () => {
    const { gameState } = useGameState()
    const seatCount = gameState.players.length
    const roomId = gameState.roomId
    const status = gameState.status as string

    const currentUserId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userId='))
        ?.split('=')[1]

    const isOwner = gameState.players[0]?.id === currentUserId

    const radiusX = 370
    const radiusY = 230

    const handleStartGame = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token || !roomId) {
                console.error('❌ Нет токена или roomId')
                return
            }

            await axios.post(`${API_URL}/room/start-game`, { roomID: roomId }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            console.log('✅ Игра запущена')

            await axios.post(`${API_URL}/room/deal-cards`, { roomID: roomId }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            console.log('🃏 Карты розданы')
        } catch (err) {
            console.error('Ошибка при старте игры или раздаче карт:', err)
        }
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-visible flex items-center justify-center">
            <TableBackground />

            {/* Центр: карты и банк */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative flex flex-col items-center">
                    <div className="flex justify-center gap-2">
                        <CommunityCards cards={gameState.communityCards} />
                    </div>
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

            {/* Кнопка запуска — только для владельца и если игра ещё не началась */}
            {status !== 'playing' && isOwner && (
                <div className="absolute bottom-6 z-50">
                    <button
                        onClick={handleStartGame}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg shadow-lg transition"
                    >
                        Начать игру
                    </button>
                </div>
            )}
        </div>
    )
}

export default PokerTable
