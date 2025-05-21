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
  const { error } = useToast();

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

  const renderTopPlayer = (player: Player, place: number, className: string, size: string, crown?: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`${className} text-black text-xs px-2 py-0.5 rounded-full`}>
        {crown ? `${crown} ` : ''}{place} {lang.leaderboard.placeLabel || 'Место'}
      </div>
      <div className={`rounded-full ${size} bg-gradient-to-br border-2 border-white shadow-lg flex items-center justify-center font-bold`}>
        {player.username[0]}
      </div>
      <div className="text-white text-sm mt-1">{player.username}</div>
      <div className="text-green-400 text-sm font-semibold">{lang.leaderboard.eloLabel} {player.elo}</div>
      <div className="text-blue-300 text-xs font-medium bg-blue-500/20 px-2 py-0.5 rounded-full mt-0.5">
        {lang.leaderboard.winRateLabel} {player.win_rate.toFixed(1)}%
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8 pb-6">
      <h1 className="text-3xl font-bold text-pink-500 tracking-wide drop-shadow-glow animate-glow">
        🏆 LEADERBOARD
      </h1>

      {/* Топ-3 */}
      <div className="flex gap-6 items-end justify-center w-full max-w-3xl">
        {top3[1] && renderTopPlayer(top3[1], 2, 'bg-pink-500', 'w-16 h-16')}
        {top3[0] && renderTopPlayer(top3[0], 1, 'bg-yellow-400 animate-pulse', 'w-20 h-20', '👑')}
        {top3[2] && renderTopPlayer(top3[2], 3, 'bg-purple-500', 'w-14 h-14')}
      </div>

      {/* Таблица */}
      <div className="w-full max-w-lg bg-white/5 border border-pink-500 rounded-xl overflow-hidden shadow-md">
        <div className="grid grid-cols-4 text-xs text-pink-400 uppercase bg-white/10 px-4 py-2 font-bold tracking-wide">
          <div>{lang.leaderboard.positionHeader}</div>
          <div>{lang.leaderboard.nicknameHeader}</div>
          <div className="text-right">{lang.leaderboard.eloLabel}</div>
          <div className="text-right">{lang.leaderboard.winRateLabel}</div>
        </div>
        <div className="overflow-y-auto max-h-[35vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {others.map((player, i) => (
            <div
              key={player.username}
              className="grid grid-cols-4 px-4 py-2 border-t border-white/10 text-sm hover:bg-pink-500/10 transition"
            >
              <div>#{i + 4}</div>
              <div>{player.username}</div>
              <div className="text-right font-semibold text-green-300">{player.elo}</div>
              <div className="text-right text-blue-300">{player.win_rate.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
