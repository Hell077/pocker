import React, { useState } from "react";
import Header from "../../components/header/header.tsx";
import Footer from "../../components/footer/footer.tsx";
import MainContent from "../../components/Main/MainContent.tsx";
import Lobby from "../../components/Lobby/Lobby.tsx"; // убедись в правильном пути
import s from "./MainPage.module.css";

type Props = {
    openAuthModal: () => void;
    openRulesModal: () => void;
};

const MainPage: React.FC<Props> = ({ openAuthModal, openRulesModal }) => {
    const [inLobby, setInLobby] = useState(false);

    return (
        <div className={s.app}>
            <Header onLoginClick={openAuthModal} />
            <main className={s.main}>
                {inLobby ? (
                    <Lobby />
                ) : (
                    <MainContent onPlay={() => setInLobby(true)} />
                )}
            </main>
            <Footer onRulesClick={openRulesModal} />
        </div>
    );
};

export default MainPage;
