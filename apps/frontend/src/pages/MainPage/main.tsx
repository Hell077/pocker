import React from "react";
import Header from "../../components/header/header.tsx";
import Footer from "../../components/footer/footer.tsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MainContent from "../../components/Main/MainContent.tsx";
import Lobby from "../../components/Lobby/Lobby.tsx";
import s from "./MainPage.module.css";

type Props = {
    openAuthModal: () => void;
    openRulesModal: () => void;
    goHome: () => void; // ✅ добавлено!
};

const MainPage: React.FC<Props> = ({ openAuthModal, openRulesModal, goHome }) => {
    const location = useLocation();
    const navigate = useNavigate();

    let content = null;
    if (location.pathname === "/") {
        content = <MainContent onPlay={() => navigate("/lobby")} />;
    } else if (location.pathname === "/lobby") {
        content = <Lobby />;
    } else {
        content = <Outlet />; // leaderboard и прочее
    }

    return (
      <div className={s.app}>
          <Header onLoginClick={openAuthModal} onGoHome={goHome} />
          <main className={s.main}>{content}</main>
          <Footer onRulesClick={openRulesModal} onGoHome={goHome} />
      </div>
    );
};

export default MainPage;
