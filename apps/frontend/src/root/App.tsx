import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import MainPage from "../pages/MainPage/main";
import LeaderboardPage from "../pages/LeaderboardPage/LeaderboardPage";
import Lobby from "../components/Lobby/Lobby";

import AuthModal from "../components/AuthModal/AuthModal";
import RulesModal from "../components/RulesModal/RulesModal";

// 👇 Добавляем импорт ProfilePage
import ProfilePage from "../pages/ProfilePage/ProfilePage";

function App() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isRulesModalOpen, setRulesModalOpen] = useState(false);

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              openAuthModal={() => setAuthModalOpen(true)}
              openRulesModal={() => setRulesModalOpen(true)}
              goHome={goHome}
            />
          }
        >
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="lobby" element={<Lobby />} />
        </Route>

        {/* 👇 Добавляем отдельный маршрут */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />
    </>
  );
}

export default App;
