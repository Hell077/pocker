const language = (localStorage.getItem('lang') || 'en') as 'en' | 'ru'

export default function LanguageSwitcher() {
  const changeLang = (lang: 'en' | 'ru') => {
    localStorage.setItem('lang', lang)
    location.reload()
  }

  return (
    <div className="flex gap-2 text-sm text-white font-semibold">
      <button
        className={`px-3 py-1 rounded ${language === 'en' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        onClick={() => changeLang('en')}
      >
        🇬🇧 EN
      </button>
      <button
        className={`px-3 py-1 rounded ${language === 'ru' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        onClick={() => changeLang('ru')}
      >
        🇷🇺 RU
      </button>
    </div>
  )
}
