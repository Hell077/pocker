// src/components/WinModal/WinModal.tsx

import React from "react";
import styles from "./WinModal.module.css";

interface WinModalProps {
    reward: string | null;
    onClose: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ reward, onClose }) => {
    if (!reward) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Поздравляем!</h2>
                <p className={styles.rewardText}>
                    🎉 Ты выиграл: <strong>{reward}</strong>
                </p>
                <button className={styles.closeButton} onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default WinModal;
