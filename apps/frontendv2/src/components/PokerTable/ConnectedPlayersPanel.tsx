import { useGameContext } from './GameStateContext'
import ReadyCountdown from '@components/PokerTable/ReadyCountdown.tsx'
import { useEffect, useState } from 'react'

const ConnectedPlayersPanel = () => {
  const { gameState, readyStatus } = useGameContext()
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [countdownKey, setCountdownKey] = useState(0)

  const allReady =
    gameState.players.length > 1 &&
    gameState.players.every((p) => readyStatus[p.id] === true) &&
    gameState.status === 'waiting'

  // сбрасываем, если кто-то отменил готовность
  useEffect(() => {
    if (!allReady) {
      setCountdownStarted(false)
      setCountdownKey((prev) => prev + 1)
    }
  }, [allReady])
  console.log('🔍 allReady:', allReady)
  console.log('🧠 countdownStarted:', countdownStarted)
  console.log('👥 players:', gameState.players.map(p => p.nickname))
  console.log('✅ readyStatus:', readyStatus)

  return (
    <div className="absolute top-4 left-4 z-50 w-64 bg-black/80 border border-yellow-400 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <h3 className="text-yellow-300 font-bold text-center text-sm mb-3 uppercase tracking-wider">
        👥 Участники стола
      </h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-3">
        {gameState.players.map((player) => (
          <li key={player.id} className="flex items-center gap-3">
            <img
              src={player.avatarUrl || '/avatars/default.png'}
              alt={player.nickname}
              className="w-8 h-8 rounded-full border border-pink-500 shadow-md object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{player.nickname}</p>
              <p className="text-green-400 text-xs">${player.chips}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Таймер */}
      {allReady && !countdownStarted && (
        <div className="text-center mt-3">
          <ReadyCountdown
            key={countdownKey}
            seconds={10}
            onComplete={() => setCountdownStarted(true)}
          />
        </div>
      )}
    </div>
  )
}

export default ConnectedPlayersPanel
