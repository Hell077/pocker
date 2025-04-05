// Main.tsx
import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer.tsx";


const Main: React.FC = () => {
    return (
        <div>
            <Header
                username="AssMaster"
                avatarUrl="/avatars/player1.png"
                balance={667}
            />
            <Footer />
        </div>
    );
};

export default Main;
