import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainPage from '@/pages/main/main.tsx';
import ProfilePage from '@/pages/Profile/Profile';
import LeaderBoardPage from '@/pages/LeaderBoard/LeaderBoard';
import LobbyPage from '@/pages/Lobby/Lobby';
import FortuneWheel from '@/pages/FortuneWheel/FortuneWheel';
import PokerTablePage from '@/pages/PokerTable/Table.tsx';
import { AuthProvider } from '@widgets/auth/AuthModal.tsx';

const App: FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderBoardPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/FortuneWheel" element={<FortuneWheel />} />
          <Route path="/table/:id" element={<PokerTablePage />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick
                        pauseOnHover theme="dark" />
      </AuthProvider>
    </div>
  );
};

export default App;
