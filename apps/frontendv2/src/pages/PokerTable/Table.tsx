import { useState } from 'react'
import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'
import PokerTable from '@/components/PokerTable/PokerTable.tsx'

export default function PokerTablePage() {
    const [uiVisible, setUiVisible] = useState(true)

    const currentUser = {
        username: 'AcePlayer',
        balance: 1500,
        avatarUrl: '',
    }

    const handleLogout = () => {
        console.log('Logout clicked')
    }

    const toggleUI = () => {
        setUiVisible(prev => !prev)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white relative">
            {/* Toggle Button */}
            <button
                onClick={toggleUI}
                className="absolute top-4 right-4 z-50 bg-pink-600 hover:bg-pink-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg transition"
            >
                {uiVisible ? 'Hide UI' : 'Show UI'}
            </button>

            {/* Header */}
            {uiVisible ? (
                <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
            ) : (
                <div className="h-[64px]" /> // 👈 высота заглушки как у Header
            )}

            {/* Main Table */}
            <main className="flex-grow flex items-center justify-center">
                <PokerTable />
            </main>

            {/* Footer */}
            {uiVisible ? <PokerFooter /> : <div className="h-[100px]" />}
        </div>
    )
}
