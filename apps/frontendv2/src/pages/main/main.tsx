import React, { useState } from 'react'
import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'
import MainContent from '@/components/MainContent/MainContent'
import { AuthProvider } from '@/widgets/auth/AuthModal'

const Main: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<{
        nickname: string
        balance: number
        avatarUrl?: string
    } | null>(null)

    const handleLogout = () => {
        console.log('Logout clicked')
        setCurrentUser(null)
    }

    return (
        <AuthProvider>
            <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
                <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
                <main className="flex-grow overflow-hidden">
                    <MainContent />
                </main>
                <PokerFooter />
            </div>
        </AuthProvider>
    )
}

export default Main
