import React, { useEffect } from 'react';
import styles from './RulesModal.module.css';
import combinationImage from '../../../public/cards/Rules.png';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const RulesModal: React.FC<Props> = ({ isOpen, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.title}>Правила покера</h2>

                <p className={styles.text}><strong>Цель игры:</strong> собрать самую сильную комбинацию карт или заставить соперников сбросить карты.</p>

                <img src={combinationImage} alt="Комбинации покера" className={styles.combinationImage} />

                <p className={styles.text}><strong>Порядок комбинаций (от самой сильной):</strong></p>
                <ul className={styles.list}>
                    <li>Роял-флеш (10-J-Q-K-A одной масти)</li>
                    <li>Стрит-флеш (пять последовательных карт одной масти)</li>
                    <li>Каре (четыре карты одного ранга)</li>
                    <li>Фул-хаус (тройка + пара)</li>
                    <li>Флеш (пять карт одной масти)</li>
                    <li>Стрит (пять последовательных карт разных мастей)</li>
                    <li>Сет (три карты одного ранга)</li>
                    <li>Две пары</li>
                    <li>Одна пара</li>
                    <li>Старшая карта</li>
                </ul>
            </div>
        </div>
    );
};

export default RulesModal;
