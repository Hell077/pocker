import FancyCard from './FancyCard'

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

const FancySeat = ({ player, isYou, index }: Props) => {
    const revealed = isYou
    const cards = player.cards ?? ['Back', 'Back']

    const isCustom3 = index === 2
    const isCustom6 = index === 5
    const isBottomSide = [3, 4].includes(index)

    const renderCards = (
      <div className="flex gap-1 mt-2 mb-2">
          {cards.map((symbol, idx) => (
            <FancyCard
              key={idx}
              revealed={revealed}
              symbol={symbol}
            />
          ))}
      </div>
    )

    return (
      <div className="flex flex-col items-center text-white z-30">
          {isCustom3 && (
            <>
                {renderCards}
                <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-md mb-2" />
                <img
                  src={player.avatarUrl}
                  alt={player.nickname}
                  className="w-14 h-14 rounded-full border-2 border-pink-500 shadow-md"
                />
                <p className="text-sm font-medium mt-1">{player.nickname}</p>
                <p className="text-green-300 text-xs font-semibold">${player.chips}</p>
            </>
          )}

          {isCustom6 && (
            <>
                <img
                  src={player.avatarUrl}
                  alt={player.nickname}
                  className="w-14 h-14 rounded-full border-2 border-pink-500 shadow-md"
                />
                <p className="text-sm font-medium mt-1">{player.nickname}</p>
                <p className="text-green-300 text-xs font-semibold">${player.chips}</p>
                <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-md mt-2" />
                {renderCards}
            </>
          )}

          {isBottomSide && !isCustom3 && !isCustom6 && (
            <>
                {renderCards}
                <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-md mb-2" />
                <img
                  src={player.avatarUrl}
                  alt={player.nickname}
                  className="w-14 h-14 rounded-full border-2 border-pink-500 shadow-md"
                />
                <p className="text-sm font-medium mt-1">{player.nickname}</p>
                <p className="text-green-300 text-xs font-semibold">${player.chips}</p>
            </>
          )}

          {!isBottomSide && !isCustom3 && !isCustom6 && (
            <>
                <img
                  src={player.avatarUrl}
                  alt={player.nickname}
                  className="w-14 h-14 rounded-full border-2 border-pink-500 shadow-md"
                />
                <p className="text-sm font-medium mt-1">{player.nickname}</p>
                <p className="text-green-300 text-xs font-semibold">${player.chips}</p>
                <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-md mt-2" />
                {renderCards}
            </>
          )}
      </div>
    )
}

export default FancySeat
