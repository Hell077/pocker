import { useGameContext } from './GameStateContext.tsx'
import TableBackground from './TableBackground'
import CommunityCards from './CommunityCards'
import Pot from './Pot'
import ActionPanel from './ActionPanel'
import PlayerHand from './PlayerHand' // ✅ новый компонент
import { useState } from 'react'
import axios from 'axios'
import { API_URL } from '@/env/api.ts'

const PokerTable = () => {
    const { gameState, sendReadyStatus } = useGameContext()
    const seatCount = gameState.players.length
    const roomId = gameState.roomId
    const status = gameState.status
    const [ready, setReady] = useState(false)

    const currentUserId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('userId='))
      ?.split('=')[1]

    const isOwner = gameState.players[0]?.id === currentUserId
    const radiusX = 370
    const radiusY = 230

    const handleToggleReady = () => {
        const next = !ready
        setReady(next)
        sendReadyStatus(next)
    }

    const handleStartGame = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token || !roomId) return

            await axios.post(`${API_URL}/room/start-game`, { roomID: roomId }, {
                headers: { Authorization: token },
            })

            await axios.post(`${API_URL}/room/deal-cards`, { roomID: roomId }, {
                headers: { Authorization: token },
            })
        } catch (err) {
            console.error('❌ Ошибка при старте игры или раздаче:', err)
        }
    }

    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
          <TableBackground />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="relative flex flex-col items-center">
                  <div className="flex justify-center gap-2">
                      <CommunityCards cards={gameState.communityCards} />
                  </div>
                  <div className="absolute top-full mt-2" style={{ left: '50%', transform: 'translate(-54%, 0)' }}>
                      <Pot amount={gameState.pot} />
                  </div>
              </div>
          </div>

          <div className="absolute w-[900px] h-[500px] rounded-full bg-gradient-to-br from-green-900 to-black border-4 border-green-700 shadow-[0_0_60px_#00ff7f55] z-10 pointer-events-none" />

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
                    {/*<FancySeat*/}
                    {/*  player={{*/}
                    {/*      ...player,*/}
                    {/*      cards: index === 0 ? myCards : ['BACK', 'BACK'],*/}
                    {/*  }}*/}
                    {/*  isYou={index === 0}*/}
                    {/*  index={index}*/}
                    {/*/>*/}
                </div>
              )
          })}

          <ActionPanel />
          <PlayerHand /> {/* 👈 панель своих карт внизу справа */}

          {status === 'waiting' && !gameState.winnerId && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                      onClick={handleToggleReady}
                      className={`px-8 py-4 rounded-xl text-white text-lg font-semibold shadow-xl transition ${
                        ready ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                        {ready ? '🚫 Отменить готовность' : '✅ Я готов'}
                    </button>
                </div>
            </div>
          )}

          {/* Кнопка старта */}
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
