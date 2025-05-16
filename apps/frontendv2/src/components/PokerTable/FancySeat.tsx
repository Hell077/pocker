import PlayingCard from './PlayingCard'


interface Player {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  cards?: string[]
}

interface Props {
  player: Player
  isYou: boolean
  index: number
}

const FancySeat = ({ player, isYou }: Props) => {
  const cards = player.cards ?? []
  console.log(`[🎴 FancySeat] ${isYou ? 'YOU' : player.nickname}`, cards)

  return (
    <div className="flex flex-col items-center text-white z-30">
      <img
        src={player.avatarUrl}
        alt={player.nickname}
        className={`w-14 h-14 rounded-full border-2 shadow-md ${
          isYou ? 'border-yellow-400' : 'border-pink-500'
        }`}
      />
      <p className={`text-sm font-medium mt-1 ${isYou ? 'text-yellow-300' : ''}`}>
        {isYou ? 'You' : player.nickname}
      </p>
      <p className="text-green-300 text-xs font-semibold mb-1">${player.chips}</p>

      {cards.length > 0 && (
        <div className="flex gap-1 mt-1">
          {cards.map((card, idx) => (
            <PlayingCard
              key={idx}
              frontImage={card}
              delay={500 + idx * 300}
            />
          ))}
        </div>
      )}


    </div>
  )
}

export default FancySeat
