import { useEffect, useState } from 'react';
import { API_URL } from '@/env/api';
import { useToast } from '@hooks/useToast.ts';
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'

interface Player {
  username: string;
  games: number;
  win_rate: number;
  elo: number;
}

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en


export default function LeaderBoard() {
  const [top3, setTop3] = useState<Player[]>([]);
  const [others, setOthers] = useState<Player[]>([]);
  const { error} = useToast();

  useEffect(() => {
    fetch(`${API_URL}/stats/table`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.data)) return;
        const sorted = [...data.data].sort((a, b) => b.elo - a.elo);
        setTop3(sorted.slice(0, 3));
        setOthers(sorted.slice(3));
      })
      .catch((err) => {
        error(lang.leaderboard.load_error(err));
      });
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 pb-6">
      <h1 className="text-3xl font-bold text-pink-500 tracking-wide drop-shadow-glow animate-glow">
        🏆 LEADERBOARD
      </h1>

      {/* Топ-3 */}
      <div className="flex gap-4 items-end justify-center w-full max-w-3xl">
        {/* Второе место */}
        {top3[1] && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-pink-500 text-black text-xs px-2 py-0.5 rounded-full">2 Место</div>
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold animate-pulse">
              {top3[1].username[0]}
            </div>
            <div className="text-pink-300 text-xs mt-1">{top3[1].username}</div>
            <div className="text-green-400 text-xs font-semibold">{lang.leaderboard.eloLabel}{top3[1].elo}</div>
          </div>
        )}

        {/* Первое место */}
        {top3[0] && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full animate-pulse">👑 1 Место</div>
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 border-2 border-white shadow-xl flex items-center justify-center text-base font-black animate-glow">
              {top3[0].username[0]}
            </div>
            <div className="text-yellow-300 text-sm mt-1">{top3[0].username}</div>
            <div className="text-green-400 text-sm font-semibold">{lang.leaderboard.eloLabel} {top3[0].elo}</div>
          </div>
        )}

        {/* Третье место */}
        {top3[2] && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-purple-500 text-black text-xs px-2 py-0.5 rounded-full">3 Место</div>
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white shadow-md flex items-center justify-center text-xs font-bold">
              {top3[2].username[0]}
            </div>
            <div className="text-purple-300 text-xs mt-1">{top3[2].username}</div>
            <div className="text-green-400 text-xs font-semibold">{lang.leaderboard.eloLabel} {top3[2].elo}</div>
          </div>
        )}
      </div>


      {/* Таблица */}
      <div className="w-full max-w-lg bg-white/5 border border-pink-500 rounded-xl overflow-hidden shadow-md">
        <div className="grid grid-cols-3 text-xs text-pink-400 uppercase bg-white/10 px-4 py-2 font-bold tracking-wide">
          <div>{lang.leaderboard.positionHeader}</div>
          <div>{lang.leaderboard.nicknameHeader}</div>
          <div className="text-right">{lang.leaderboard.eloLabel}</div>
        </div>
        <div
          className="overflow-y-auto max-h-[35vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {others.map((player, i) => (
            <div
              key={player.username}
              className="grid grid-cols-3 px-4 py-2 border-t border-white/10 text-sm hover:bg-pink-500/10 transition"
            >
              <div>#{i + 4}</div>
              <div>{player.username}</div>
              <div className="text-right font-semibold text-green-300">{player.elo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
