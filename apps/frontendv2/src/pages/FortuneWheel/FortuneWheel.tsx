import PokerHeader from '@/components/header/header';
import PokerFooter from '@/components/footer/footer';
import Fortune from '@/components/FortuneWheel/FortuneWheel';
import { useState } from 'react';


export default function FortuneWheelPage() {
  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const [currentUser] = useState<{
    username: string
    balance: number
    avatarUrl?: string
  } | null>(null);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-grow p-4">
        <Fortune />
      </main>
      <PokerFooter />
    </div>
  );
}