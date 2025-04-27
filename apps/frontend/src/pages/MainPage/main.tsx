// src/pages/MainPage/MainPage.tsx

import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MainContent from "../../components/Main/MainContent";
import Lobby from "../../components/Lobby/Lobby";
import LeaderboardPage from "../LeaderboardPage/LeaderboardPage";      // если хочешь рендерить без Outlet
import ProfilePage from "../Profile/Dashboard";                            // твоя страница профиля
import FortuneWheelPage from "../Fortune/FortuneWheelPage";                  // твоя страница колеса фортуны

import s from "./MainPage.module.css";

type Props = {
    openAuthModal: () => void;
    openRulesModal: () => void;
    goHome: () => void;
};

const MainPage: React.FC<Props> = ({ openAuthModal, openRulesModal, goHome }) => {
    const location = useLocation();
    const navigate = useNavigate();

    let content = null;

    if (location.pathname === "/") {
        // главная страница
        content = <MainContent onPlay={() => navigate("/lobby")} />;
    } else if (location.pathname === "/lobby") {
        // лобби
        content = <Lobby />;
    } else if (location.pathname === "/leaderboard") {
        // лидерборд (можно через Outlet, но так явно)
        content = <LeaderboardPage />;
    } else if (location.pathname === "/profile") {
        // страница профиля
        content = <ProfilePage />;
    } else if (location.pathname === "/fortune") {
        // колесо фортуны
        content = <FortuneWheelPage />;
    } else {
        // все остальные (если добавишь новые вложенные)
        content = <Outlet />;
    }

    return (
        <div className={s.app}>
            <Header onLoginClick={openAuthModal} onGoHome={goHome} />

            <main className={s.main}>
                {content}
            </main>

            <Footer onRulesClick={openRulesModal} onGoHome={goHome} />
        </div>
    );
};

export default MainPage;
