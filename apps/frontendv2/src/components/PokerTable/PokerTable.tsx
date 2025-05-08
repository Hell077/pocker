import { FaUser } from 'react-icons/fa'

const players = [
    { id: 1, name: 'AI-Aggro', balance: 990 },
    { id: 2, name: 'StackZilla', balance: 1520 },
    { id: 3, name: 'YOU', balance: 1400, isSelf: true },
    { id: 4, name: 'FoldBot', balance: 650 },
    { id: 5, name: 'Neo', balance: 1250 },
    { id: 6, name: 'BluffQueen', balance: 980 },
]

const PokerTable = () => {
    const playerPositions = [
        'top-left',
        'top-center',
        'bottom-center',
        'bottom-left',
        'top-right',
        'bottom-right',
    ]

    return (
        <div className="relative w-full max-w-[1100px] aspect-[2/1] mx-auto my-8">
            {/* Table */}
            <div className="absolute inset-0 rounded-full border-[10px] border-pink-500 bg-green-700 shadow-[0_0_60px_rgba(255,0,128,0.5)]" />

            {/* Pot */}
            <div className="absolute top-[41%] left-1/2 -translate-x-1/2 text-yellow-400 font-semibold text-lg">
                🪙 Pot: <span className="font-bold">$2050</span>
            </div>

            {/* Community Cards */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 flex gap-3">
                {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                        <div
                            key={idx}
                            className="w-12 h-16 bg-white rounded-lg shadow-md border border-gray-300"
                        />
                    ))}
            </div>

            {/* Players */}
            {players.map((player, index) => {
                const position = playerPositions[index]
                const baseStyle = 'absolute flex flex-col items-center z-10'

                const posStyle = {
                    'top-left': 'top-10 left-16',
                    'top-center': 'top-4 left-1/2 -translate-x-1/2',
                    'top-right': 'top-10 right-16',
                    'bottom-left': 'bottom-28 left-16',
                    'bottom-right': 'bottom-28 right-16',
                    'bottom-center': 'bottom-12 left-1/2 -translate-x-1/2',
                }

                return (
                    <div
                        key={player.id}
                        className={`${baseStyle} ${posStyle[position as keyof typeof posStyle]}`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-14 h-14 rounded-full border-4 ${
                                player.isSelf ? 'border-pink-500' : 'border-white'
                            } flex items-center justify-center text-sm font-bold bg-black text-white shadow-md mb-2`}
                        >
                            <FaUser className="text-white" />
                        </div>

                        {/* Info */}
                        <div className="text-sm font-semibold text-white">{player.name}</div>
                        <div className="text-xs text-green-300">${player.balance}</div>

                        {/* Player hand */}
                        {player.isSelf && (
                            <div className="flex gap-3 mt-3">
                                <div className="w-12 h-16 bg-white rounded shadow-md border border-gray-300" />
                                <div className="w-12 h-16 bg-white rounded shadow-md border border-gray-300" />
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Action Buttons */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-6">
                {['Check', 'Call', 'Raise'].map((action) => (
                    <button
                        key={action}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg transition"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PokerTable
