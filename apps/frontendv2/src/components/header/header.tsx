import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { useAuth } from '@/widgets/auth/AuthModal'

interface User {
    nickname: string
    avatarUrl?: string
    balance: number
}

interface PokerHeaderProps {
    currentUser: User | null
    onLogout: () => void
}

export default function PokerHeader({ currentUser, onLogout }: PokerHeaderProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { openModal } = useAuth()

    return (
        <header className="w-full bg-black bg-opacity-60 backdrop-blur-md border-b border-pink-500 shadow-lg">
            <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">

                {/* Логотип с анимацией дыхания и переходом */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-2xl font-bold text-pink-500 tracking-wider drop-shadow-glow select-none animate-pulse hover:scale-105 transition"
                >
                    <span className="text-3xl">♠</span>
                    PockerKingdom
                </Link>

                {/* Навигация */}
                <nav className="flex gap-8 text-white font-medium items-center">
                    <Link to="/lobby" className="hover:text-pink-400 transition">Lobby</Link>
                    <Link to="/leaderboard" className="hover:text-pink-400 transition">Leaderboard</Link>
                    <Link to="/profile" className="hover:text-pink-400 transition">Profile</Link>
                </nav>

                {/* Авторизация / Юзер-блок */}
                {!currentUser ? (
                    <button
                        onClick={openModal}
                        className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition"
                    >
                        Войти
                    </button>
                ) : (
                    <div
                        className="relative flex items-center gap-3 cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {currentUser.avatarUrl ? (
                            <img
                                src={currentUser.avatarUrl}
                                alt="avatar"
                                className="w-10 h-10 rounded-full border-2 border-pink-500 shadow-md object-cover"
                            />
                        ) : (
                            <FaUserCircle className="w-10 h-10 text-pink-500" />
                        )}
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-white">{currentUser.nickname}</span>
                            <span className="text-xs font-bold text-green-400">{currentUser.balance} фишек</span>
                        </div>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-12 w-40 bg-black border border-pink-500 rounded-xl shadow-lg z-50">
                                <Link to="/profile" className="block px-4 py-2 text-white hover:bg-pink-600 rounded-t-xl">Profile</Link>
                                <Link to="/settings" className="block px-4 py-2 text-white hover:bg-pink-600">Settings</Link>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-white hover:bg-pink-600 rounded-b-xl"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
