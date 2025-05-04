export default function LeaderBoard() {
    const top3 = [
        { nickname: 'AceKing', score: 5800 },
        { nickname: 'QueenBee', score: 5400 },
        { nickname: 'BluffMaster', score: 5100 },
    ]

    const others = Array.from({ length: 12 }, (_, i) => ({
        nickname: `Player${i + 4}`,
        score: 5000 - i * 100,
    }))

    return (
        <div className="flex flex-col items-center gap-8 pb-6">
            <h1 className="text-3xl font-bold text-pink-500 tracking-wide drop-shadow-glow animate-glow">
                🏆 LEADERBOARD
            </h1>

            {/* Топ-3 */}
            <div className="flex gap-4 items-end justify-center w-full max-w-3xl">
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-pink-500 text-black text-xs px-2 py-0.5 rounded-full">2 Место</div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold animate-pulse">
                        {top3[1].nickname[0]}
                    </div>
                    <div className="text-pink-300 text-xs mt-1">{top3[1].nickname}</div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full animate-pulse">👑 1 Место</div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 border-2 border-white shadow-xl flex items-center justify-center text-base font-black animate-glow">
                        {top3[0].nickname[0]}
                    </div>
                    <div className="text-yellow-300 text-sm mt-1">{top3[0].nickname}</div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="bg-purple-500 text-black text-xs px-2 py-0.5 rounded-full">3 Место</div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white shadow-md flex items-center justify-center text-xs font-bold">
                        {top3[2].nickname[0]}
                    </div>
                    <div className="text-purple-300 text-xs mt-1">{top3[2].nickname}</div>
                </div>
            </div>

            {/* Таблица */}
            <div className="w-full max-w-lg bg-white/5 border border-pink-500 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-3 text-xs text-pink-400 uppercase bg-white/10 px-4 py-2 font-bold tracking-wide">
                    <div>Место</div>
                    <div>Никнейм</div>
                    <div className="text-right">Очки</div>
                </div>
                <div className="overflow-y-auto max-h-[35vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {others.map((player, i) => (
                        <div
                            key={player.nickname}
                            className="grid grid-cols-3 px-4 py-2 border-t border-white/10 text-sm hover:bg-pink-500/10 transition"
                        >
                            <div>#{i + 4}</div>
                            <div>{player.nickname}</div>
                            <div className="text-right font-semibold text-green-300">{player.score}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
