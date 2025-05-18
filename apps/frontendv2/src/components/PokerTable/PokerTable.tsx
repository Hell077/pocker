import { useGameContext } from './GameStateContext.tsx'
import TableBackground from './TableBackground'
import CommunityCards from './CommunityCards'
import Pot from './Pot'
import ActionPanel from './ActionPanel'
import ConnectedPlayersPanel from './ConnectedPlayersPanel'
import { useEffect, useMemo, useState } from 'react'
import { WinnerModal } from './WinnerBanner.tsx'
import FancySeat from '@components/PokerTable/FancySeat.tsx'
import { useNavigate } from 'react-router-dom'
import PlayerHand from '@components/PokerTable/PlayerHand.tsx';

const PokerTable = () => {
    const {
        gameState,
        sendReadyStatus,
        setReadyStatus,
    } = useGameContext()

    const navigate = useNavigate()
    const [ready, setReady] = useState(false)

    const currentUserId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('userId='))
      ?.split('=')[1]

    const status = gameState.status

    const seats = useMemo(() => {
        const result = Array(6).fill(null)
        const you = gameState.players.find(p => p.id === currentUserId)
        const others = gameState.players.filter(p => p.id !== currentUserId)

        if (you) result[0] = you

        others.forEach((p, i) => {
            if (i + 1 < 6) result[i + 1] = p
        })

        return result
    }, [gameState.players, currentUserId])

    useEffect(() => {
        if (gameState.winnerId) {
            const timeout = setTimeout(() => {
                navigate('/')
            }, 8000)
            return () => clearTimeout(timeout)
        }
    }, [gameState.winnerId, navigate])

    const handleToggleReady = () => {
        const next = !ready
        setReady(next)
        sendReadyStatus(next)

        if (currentUserId) {
            setReadyStatus((prev) => ({
                ...prev,
                [currentUserId]: next,
            }))
        }
    }


    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
          <TableBackground />
          <ConnectedPlayersPanel />

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

          <div className="absolute w-[900px] h-[500px] rounded-full bg-gradient-to-br from-green-900 to-black border-4 border-green-700 shadow-[0_0_60px_#00ff7f55] z-10 pointer-events-none" />

          {seats.map((player, index) => {
              const angleDeg = (360 / 6) * index - 90
              const angleRad = (angleDeg * Math.PI) / 180

              const radiusX = 420
              const radiusY = 260
              const offsetY = -10

              const x = radiusX * Math.cos(angleRad)
              const y = radiusY * Math.sin(angleRad) + offsetY

              return (
                <div
                  key={player?.id || `empty-${index}`}
                  className="absolute z-30"
                  style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                  }}
                >
                    {player ? (
                      <FancySeat player={player} isYou={player.id === currentUserId} index={index} />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-gray-500 bg-gray-800 opacity-30" />
                    )}
                </div>
              )
          })}

          <ActionPanel />

          {/* READY-кнопка */}
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
          <PlayerHand/>
          <WinnerModal />
      </div>
    )
}

export default PokerTable
