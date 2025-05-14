import { useGameContext } from './GameStateContext'
import PlayingCard from './PlayingCard'

const PlayerHand = () => {
  const { myCards } = useGameContext()

  if (!myCards.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-black/60 p-3 rounded-xl border border-pink-500 shadow-lg">
      {myCards.map((symbol, idx) => (
        <PlayingCard key={idx} frontImage={symbol} delay={0} />
      ))}
    </div>
  )
}

export default PlayerHand
