import { FC } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainPage from '@/pages/main/main.tsx'
import ProfilePage from '@/pages/Profile/Profile'
import LeaderBoardPage from '@/pages/LeaderBoard/LeaderBoard'
import LobbyPage from '@/pages/Lobby/Lobby' // 👈 импорт новой страницы
import FortuneWheel from '@/pages/FortuneWheel/FortuneWheel'

const App: FC = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 text-white">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderBoardPage />} />
                <Route path="/lobby" element={<LobbyPage />} /> {/* 👈 добавлен маршрут */}
                <Route path="/FortuneWheel" element={<FortuneWheel />} />
            </Routes>
        </div>
    )
}

export default App
