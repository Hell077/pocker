import { FC } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainPage from '@/pages/main/main.tsx'
import ProfilePage from '@/pages/Profile/Profile'
import LeaderBoardPage from '@/pages/LeaderBoard/LeaderBoard'
import LobbyPage from '@/pages/Lobby/Lobby'
import FortuneWheel from '@/pages/FortuneWheel/FortuneWheel'
import PokerTablePage from '@/pages/PokerTable/Table.tsx'

const App: FC = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 text-white">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderBoardPage />} />
                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/FortuneWheel" element={<FortuneWheel />} />
                <Route path="/table/:id" element={<PokerTablePage />} />
            </Routes>
        </div>
    )
}

export default App
