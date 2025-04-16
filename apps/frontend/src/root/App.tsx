import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import MainPage from '../pages/MainPage/main.tsx';
import AuthModal from '../components/AuthModal/AuthModal';
import RulesModal from '../components/RulesModal/RulesModal'; // ✅ Добавляем импорт

function App() {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isRulesModalOpen, setRulesModalOpen] = useState(false); // ✅ Новый стейт

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainPage
                            openAuthModal={() => setAuthModalOpen(true)}
                            openRulesModal={() => setRulesModalOpen(true)} // ✅ Передаём проп
                        />
                    }
                />
            </Routes>

            {/* Модалки вне роутов */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />
            <RulesModal
                isOpen={isRulesModalOpen}
                onClose={() => setRulesModalOpen(false)}
            />
        </BrowserRouter>
    );
}

export default App;
