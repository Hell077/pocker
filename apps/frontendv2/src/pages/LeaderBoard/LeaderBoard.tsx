import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'
import LeaderBoard from '@/components/LeaderBoard/LeaderBoard'
import { useState } from 'react';

export default function LeaderBoardPage() {
  const [currentUser] = useState<{
    username: string
    balance: number
    avatarUrl?: string
  } | null>(null)

  return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            <PokerHeader
                currentUser={currentUser}
                onLogout={() => {
                    console.log('Logout noop')
                }}
            />

            <main className="flex-1 w-full px-4 py-10 max-w-5xl mx-auto">
                <LeaderBoard />
            </main>

            <PokerFooter />
        </div>
    )
}
