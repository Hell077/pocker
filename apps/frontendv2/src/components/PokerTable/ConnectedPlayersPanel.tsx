import { useGameContext } from './GameStateContext'

const ConnectedPlayersPanel = () => {
  const { gameState } = useGameContext()

  return (
    <div className="absolute top-4 left-4 z-50 w-64 bg-black/80 border border-yellow-400 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <h3 className="text-yellow-300 font-bold text-center text-sm mb-3 uppercase tracking-wider">
        👥 Участники стола
      </h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
    </div>
  )
}

export default ConnectedPlayersPanel
