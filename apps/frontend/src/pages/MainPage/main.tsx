import React from "react";
import Header from "../../components/header/header.tsx";
import Footer from "../../components/footer/footer.tsx";
import MainContent from "../../components/Main/MainContent.tsx";
import s from "./MainPage.module.css";

type Props = {
    openAuthModal: () => void;
    openRulesModal: () => void;
};

const MainPage: React.FC<Props> = ({ openAuthModal, openRulesModal }) => {
    return (
        <div className={s.app}>
            <Header onLoginClick={openAuthModal} />
            <main className={s.main}>
                <MainContent />
            </main>
            <Footer onRulesClick={openRulesModal} />
        </div>
    );
};

export default MainPage;
