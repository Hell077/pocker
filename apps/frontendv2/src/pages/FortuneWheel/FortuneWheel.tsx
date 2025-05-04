import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'
import Fortune from '@/components/FortuneWheel/FortuneWheel'

const currentUser = {
    nickname: 'AcePlayer',
    balance: 1500,
    avatarUrl: '',
}

export default function FortuneWheelPage() {
    const handleLogout = () => {
        console.log('Logout clicked')
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white">
            <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
            <main className="flex-grow p-4">
                <Fortune />
            </main>
            <PokerFooter />
        </div>
    )
}