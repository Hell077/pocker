import { useNavigate } from 'react-router-dom';
import { ru } from '@lang/ru.ts';
import { en } from '@lang/en.ts';

export default function MainContent() {
  const navigate = useNavigate();
  const language = localStorage.getItem('lang') || 'en';
  const lang = language === 'ru' ? ru : en;
  const handlePlayClick = () => {
    console.log('Play clicked');
  };

  const handleFortuneClick = () => {
    navigate('/FortuneWheel');
  };

  return (
    <div
      className="h-full w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden animate-fade-in">
      {/* Блюр-рамка */}
      <div
        className="bg-white/10 backdrop-blur-xl border border-pink-500 rounded-2xl p-12 shadow-xl max-w-sm w-full flex items-center justify-center animate-fade-up">
        <button
          onClick={handlePlayClick}
          className="px-10 py-4 text-lg font-semibold text-pink-400 bg-black bg-opacity-30 rounded-xl border border-pink-500 shadow-md hover:shadow-pink-500/30 transition duration-300 ease-in-out hover:scale-105 focus:outline-none animate-pulse"
        >
          Play
        </button>
      </div>

      <div
        onClick={handleFortuneClick}
        className="absolute bottom-6 left-6 group cursor-pointer w-max"
      >
        <div className="relative flex items-center">
          <div
            className="w-6 h-6 border-r-2 border-t-2 border-pink-500 rotate-45 transition-transform duration-300 group-hover:translate-x-32 animate-glow" />

          <span
            className="absolute left-12 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-200 text-pink-400 text-xs font-medium animate-pulse whitespace-nowrap">
            {lang.main.luck}
          </span>
        </div>
      </div>
    </div>
  );
}