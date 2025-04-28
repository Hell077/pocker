import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

// Импорты страниц
import MainPage from "../pages/MainPage/main";
import LeaderboardPage from "../pages/LeaderboardPage/LeaderboardPage";
import Lobby from "../components/Lobby/Lobby";

// Новые страницы
import ProfilePage from "../pages/Profile/Dashboard";
import FortuneWheelPage from "../pages/Fortune/FortuneWheelPage";

// Страница Poker Table
import PokerTablePage from "../pages/PokerPage/PokerPage"; // <--- добавил!

// Модалки
import AuthModal from "../components/AuthModal/AuthModal";
import RulesModal from "../components/RulesModal/RulesModal";

function App() {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isRulesModalOpen, setRulesModalOpen] = useState(false);

    const navigate = useNavigate();
    const goHome = () => navigate("/");

    return (
        <>
            <Routes>
                {/* Главная страница */}
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
                    {/* Вложенные маршруты */}
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="lobby" element={<Lobby />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="fortune" element={<FortuneWheelPage />} />
                </Route>

                {/* ВНЕШНИЙ роут для PokerTable */}
                <Route path="/PokerTable" element={<PokerTablePage />} />
            </Routes>

            {/* Модалки для авторизации и правил */}
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
