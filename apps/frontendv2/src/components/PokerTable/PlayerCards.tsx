import { useGameContext } from './GameStateContext'
import PlayingCard from './PlayingCard'

const PlayerCards = () => {
  const { myCards } = useGameContext()

  return (
    <div className="flex gap-2 mt-2 absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      {myCards.map((card, idx) => (
        <PlayingCard
          key={idx}
          frontImage={`/PNG/${card}.png`}
          delay={300 + idx * 200} 
        />
      ))}
    </div>
  )
}

export default PlayerCards
