import React from "react";
import FortuneWheel from "../../components/FortuneWheel/FortuneWheel";

const FortuneWheelPage: React.FC = () => {
    return (
        <div style={styles.page}>
            <h1 style={styles.title}>🎰 Wheel of Fortune 🎰</h1>
            <FortuneWheel />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "2rem",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #000000, #1a1a1a)",
    },
    title: {
        fontSize: "2.5rem",
        marginBottom: "2rem",
        color: "#fff",
        textShadow: "0 0 10px #ff00ff, 0 0 20px #00ffff",
    },
};

export default FortuneWheelPage;
