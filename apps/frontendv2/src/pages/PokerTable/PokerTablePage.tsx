import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import PokerTable from '@/components/PokerTable/PokerTable'
import PockerHeader from '@/components/header/header.tsx'

interface User {
    username: string
    avatarUrl?: string
    balance: number
}

const PokerTablePage = () => {
    const { roomId } = useParams()
    const [showHeader, setShowHeader] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    // Чтение пользователя из localStorage
    const updateUser = useCallback(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                const parsed: User = JSON.parse(stored)
                if (parsed?.username) setUser(parsed)
                else setUser(null)
            } catch {
                setUser(null)
            }
        } else {
            setUser(null)
        }
    }, [])

    // Обновлять при загрузке и событиях
    useEffect(() => {
        updateUser()
        window.addEventListener('auth-updated', updateUser)
        window.addEventListener('auth-logout', updateUser)
        return () => {
            window.removeEventListener('auth-updated', updateUser)
            window.removeEventListener('auth-logout', updateUser)
        }
    }, [updateUser])

    const handleLogout = () => {
        window.dispatchEvent(new Event('auth-logout'))
    }

    return (
        <div className="w-full h-screen relative overflow-hidden">
            {/* Header */}
            {showHeader && (
                <div className="absolute top-0 left-0 w-full z-50">
                    <PockerHeader currentUser={user} onLogout={handleLogout} />
                </div>
            )}

            {/* Toggle Header */}
            <button
                onClick={() => setShowHeader(!showHeader)}
                className="absolute top-4 right-4 z-50 px-3 py-1 rounded bg-black/70 border border-yellow-400 text-yellow-300 text-xs hover:bg-yellow-900 transition-all"
            >
                {showHeader ? 'Hide Header' : 'Show Header'}
            </button>

            {/* Table */}
            <PokerTable />

            {/* Room ID */}
            <div className="absolute top-4 left-4 text-sm text-gray-300 z-40">
                Room ID: <span className="font-mono text-white">{roomId}</span>
            </div>
        </div>
    )
}

export default PokerTablePage
