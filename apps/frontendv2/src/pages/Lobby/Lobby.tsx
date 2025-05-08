import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'
import LobbyContent from '@/components/Lobby/Lobby'
import { useState } from 'react';

export default function LobbyPage() {
  const [currentUser, setCurrentUser] = useState<{
    username: string
    balance: number
    avatarUrl?: string
  } | null>(null)

  const handleLogout = () => {
    console.log('Logout clicked')
    setCurrentUser(null)
  }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white">
            <PokerHeader currentUser={currentUser} onLogout={handleLogout}/>

            <main className="flex-grow px-4 py-8 max-w-screen-xl mx-auto w-full">
                <LobbyContent />
            </main>

            <PokerFooter />
        </div>
    )
}
