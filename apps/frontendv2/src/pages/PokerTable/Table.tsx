import { useState } from 'react';
import PokerHeader from '@/components/header/header';
import PokerFooter from '@/components/footer/footer';
import { GameStateProvider } from '@components/PokerTable/GameStateContext.tsx';
import PokerTable from '@components/PokerTable/PokerTable.tsx';

export default function PokerTablePage() {
  const [uiVisible, setUiVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    username: string
    balance: number
    avatarUrl?: string
  } | null>(null);

  const handleLogout = () => {
    console.log('Logout clicked')
    setCurrentUser(null)
  }


  const toggleUI = () => {
    setUiVisible(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white relative">
      <button
        onClick={toggleUI}
        className="absolute top-4 right-4 z-50 bg-pink-600 hover:bg-pink-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg transition"
      >
        {uiVisible ? 'Hide UI' : 'Show UI'}
      </button>

      {uiVisible ? (
        <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <div className="h-[64px]" />
      )}

      <GameStateProvider>
        <main className="flex-grow flex items-center justify-center">
          <PokerTable />
        </main>

      </GameStateProvider>


      {uiVisible ? <PokerFooter /> : <div className="h-[100px]" />}
    </div>
  );
}

