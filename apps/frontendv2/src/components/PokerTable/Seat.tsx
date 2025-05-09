import PlayerCards from './PlayerCards'
import ChipStack from './ChipStack'

interface SeatProps {
  index: number
}

const Seat = ({ index }: SeatProps) => {
  const isYou = index === 0
  const player = {
    nickname: `Player ${index + 1}`,
    avatarUrl: `https://i.pravatar.cc/150?img=${index + 1}`,
    chips: Math.floor(Math.random() * 1000) + 500,
  }

  const positionStyles = [
    'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-24 left-8',
    'top-24 left-8',
    'top-4 left-1/2 -translate-x-1/2',
    'top-24 right-8',
    'bottom-24 right-8',
  ]

  return (
    <div className={`absolute flex flex-col items-center text-white ${positionStyles[index]} transition-all duration-300`}>
      <img
        src={player.avatarUrl}
        alt={player.nickname}
        className="w-14 h-14 rounded-full border-2 border-pink-500 shadow-lg"
      />
      <p className="mt-1 text-sm font-medium">{player.nickname}</p>
      <ChipStack amount={player.chips} />
      {isYou && <PlayerCards />}
    </div>
  )
}

export default Seat
