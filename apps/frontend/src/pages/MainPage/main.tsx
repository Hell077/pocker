import React from "react";
import Header from "../../components/header/header.tsx";
import Footer from "../../components/footer/footer.tsx";
import MainContent from "../../components/Main/MainContent.tsx";
import s from "./MainPage.module.css"


const MainPage: React.FC = () => {
    return (
        <div className={s.app}>
            <Header
                username="AssMaster"
                avatarUrl="/avatars/player1.png"
                balance={667}
            />
            <main className={s.main}>
                <MainContent />
            </main>
            <Footer />
        </div>
    );
};

export default MainPage;
