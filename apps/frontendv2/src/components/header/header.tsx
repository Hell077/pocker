import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { useAuth } from '@/widgets/auth/AuthModal'

interface User {
    username: string
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
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const [localUser, setLocalUser] = useState<User | null>(null)

    const updateUserFromStorage = () => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                const parsed: User = JSON.parse(stored)
                if (parsed?.username) {
                    setLocalUser(parsed)
                }
            } catch (err) {
                console.error('Failed to parse user from localStorage:', err)
            }
        } else {
            setLocalUser(null)
        }
    }

    useEffect(() => {
        updateUserFromStorage()

        window.addEventListener('auth-updated', updateUserFromStorage)
        window.addEventListener('auth-logout', updateUserFromStorage)
        return () => {
            window.removeEventListener('auth-updated', updateUserFromStorage)
            window.removeEventListener('auth-logout', updateUserFromStorage)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownOpen])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        document.cookie = `username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `balance=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `avatarUrl=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`

        window.dispatchEvent(new Event('auth-logout'))
        setLocalUser(null)
        onLogout()
        navigate('/')
    }

    const user = currentUser || localUser

    return (
      <header className="w-full bg-black bg-opacity-60 backdrop-blur-md border-b border-pink-500 shadow-lg z-40 relative overflow-visible">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 text-2xl font-bold text-pink-500 tracking-wider drop-shadow-glow select-none animate-pulse hover:scale-105 transition"
              >
                  <span className="text-3xl">♠</span>
                  PockerKingdom
              </Link>

              <nav className="flex gap-8 text-white font-medium items-center">
                  <Link to="/lobby" className="hover:text-pink-400 transition">Lobby</Link>
                  <Link to="/leaderboard" className="hover:text-pink-400 transition">Leaderboard</Link>
                  <Link to="/profile" className="hover:text-pink-400 transition">Profile</Link>
              </nav>

              {!user ? (
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition"
                >
                    Войти
                </button>
              ) : (
                <div
                  ref={dropdownRef}
                  className="relative flex items-center gap-3 cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border-2 border-pink-500 shadow-md object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-pink-500" />
                    )}
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-white">{user.username}</span>
                        <span className="text-xs font-bold text-green-400">{user.balance} фишек</span>
                    </div>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-12 w-40 bg-black border border-pink-500 rounded-xl shadow-lg z-[9999]">
                          <Link to="/profile" className="block px-4 py-2 text-white hover:bg-pink-600 rounded-t-xl">Profile</Link>
                          <Link to="/settings" className="block px-4 py-2 text-white hover:bg-pink-600">Settings</Link>
                          <button
                            onClick={handleLogout}
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
