import React, { useState } from 'react';
import PokerHeader from '@/components/header/header';
import PokerFooter from '@/components/footer/footer';
import MainContent from '@/components/MainContent/MainContent';

const Main: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{
    username: string
    balance: number
    avatarUrl?: string
  } | null>(null);

  const handleLogout = () => {
    console.log('Logout clicked');
    setCurrentUser(null);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <PokerHeader currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-grow overflow-hidden">
        <MainContent />
      </main>
      <PokerFooter />
    </div>
  );
};

export default Main;
