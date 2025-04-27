import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DashBoard.module.css";

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<"profile" | "history" | "achievements">("profile");

    const player = {
        avatar: "https://i.pravatar.cc/150?img=65",
        nickname: "PokerKing99",
        balance: 15320,
        gamesPlayed: 245,
        gamesWon: 97,
        levelProgress: 65,
    };

    return (
        <div className={styles.profileWrapper}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.profileCard}
            >
                {/* Верхняя часть: Аватар + Ник */}
                <div className={styles.topSection}>
                    <img src={player.avatar} alt="Avatar" className={styles.avatar} />
                    <h2 className={styles.nickname}>{player.nickname}</h2>
                </div>

                {/* Нижняя часть: Статы */}
                <div className={styles.bottomSection}>
                    <div className={styles.statItem}>
                        <p className={styles.statLabel}>Balance</p>
                        <p className={styles.statValue}>{player.balance} 💰</p>
                    </div>
                    <div className={styles.statItem}>
                        <p className={styles.statLabel}>Games</p>
                        <p className={styles.statValue}>{player.gamesPlayed}</p>
                    </div>
                    <div className={styles.statItem}>
                        <p className={styles.statLabel}>Wins</p>
                        <p className={styles.statValue}>{player.gamesWon}</p>
                    </div>
                    <div className={styles.statItem}>
                        <p className={styles.statLabel}>Level</p>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${player.levelProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
