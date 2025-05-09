import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import MainPage from '@/pages/main/main.tsx'
import ProfilePage from '@/pages/Profile/Profile'
import LeaderBoardPage from '@/pages/LeaderBoard/LeaderBoard'
import LobbyPage from '@/pages/Lobby/Lobby'
import FortuneWheel from '@/pages/FortuneWheel/FortuneWheel'
import PokerTablePage from '@/pages/PokerTable/PokerTablePage'

import { AuthProvider } from '@widgets/auth/AuthModal.tsx'
import { ProtectedRoute } from '@/utils/ProtectedRoute'

const App: FC = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 text-white">
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<ProtectedRoute><LeaderBoardPage /></ProtectedRoute>} />
                    <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
                    <Route path="/FortuneWheel" element={<ProtectedRoute><FortuneWheel /></ProtectedRoute>} />

                    {/* ⛔️ Без авторизации */}
                    <Route path="/table/:roomId" element={<PokerTablePage />} />
                </Routes>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="dark"
                />
            </AuthProvider>
        </div>
    )
}

export default App
