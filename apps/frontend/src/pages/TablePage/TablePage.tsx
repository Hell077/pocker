import React from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/header/header.tsx";
import Footer from "../../components/footer/footer.tsx";
import styles from "./TablePage.module.css";

const TablePage: React.FC = () => {
    const { roomId } = useParams();

    const players = [
        { name: "Player 1", bet: 0 },
        { name: "Player 2", bet: 200 },
        { name: "Player 3", bet: 0 },
        { name: "Player 4", bet: 500 },
        { name: "Player 5", bet: 0 },
        { name: "Player 6", bet: 1000 },
    ];

    const activeIndex = 2; // индекс активного игрока (0-based)

    const totalBets = players.reduce((sum, p) => sum + p.bet, 0);

    return (
        <div className={styles.app}>
            <Header onLoginClick={() => {}} />
            <main className={styles.main}>
                <h2 className={styles.title}>Room: {roomId}</h2>
                <div className={styles.table}>
                    {/* 👤 Дилер */}
                    <div className={styles.dealer}>
                        Dealer
                        <div className={styles.totalBets}>🟣 {totalBets}</div>
                    </div>

                    {/* 🂠 Стол под 5 карт */}
                    <div className={styles.cardBoard}>
                        <div className={styles.cardSlot}></div>
                        <div className={styles.cardSlot}></div>
                        <div className={styles.cardSlot}></div>
                        <div className={styles.cardSlot}></div>
                        <div className={styles.cardSlot}></div>
                    </div>

                    {/* 🧍 Игроки */}
                    {players.map((player, idx) => (
                        <div
                            key={idx}
                            className={`${styles.seat} ${styles.seatCircle} ${styles[`seat${idx + 1}`]} ${
                                idx === activeIndex ? styles.active : ""
                            }`}
                        >
                            <span className={styles.playerName}>{player.name}</span>
                            <span className={styles.bet}>🟣 {player.bet}</span>
                        </div>
                    ))}

                    {/* 💰 Пот */}
                    <div className={styles.potZone}></div>
                    <div className={styles.pot}>🟣 3200</div>
                </div>
            </main>
            <Footer onRulesClick={() => {}} />
        </div>
    );
};

export default TablePage;
