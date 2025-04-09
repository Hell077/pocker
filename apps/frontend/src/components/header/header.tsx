import React, { useState } from 'react';
import styles from './PockerHeader.module.css';
import '../../root/root.module.css';  // Убедись, что стили правильные
import { User, Settings, LogOut, ChevronDown, Gamepad2 } from 'lucide-react';

type Props = {
    username: string;
    avatarUrl: string;
    balance: number;
};

const Header: React.FC<Props> = ({ username, avatarUrl, balance }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>♠ PokerKingdom</div>

            <nav className={styles.nav}>
                <a href="#" className={styles.link}>Home</a>
                <a href="#" className={styles.link}>Tournaments</a>
                <a href="#" className={styles.link}>Leaderboard</a>
            </nav>

            <div className={styles.rightSide}>
                <button className={styles.playNow}>
                    <Gamepad2 size={18} style={{ marginRight: 8 }} />
                    Играть сейчас
                </button>

                <div className={styles.balance}>💰 {balance.toLocaleString()}</div>

                <div className={styles.dropdownWrapper}>
                    <div onClick={toggleMenu} className={styles.user}>
                        <img src={avatarUrl} alt="Avatar" className={styles.avatar} />
                        <span className={styles.username}>{username}</span>
                        <ChevronDown size={16} />
                    </div>

                    <div className={`${styles.dropdown} ${isMenuOpen ? styles.show : ''}`}>
                        <a href="#"><User size={16} /> Профиль</a>
                        <a href="#"><Settings size={16} /> Настройки</a>
                        <a href="#"><LogOut size={16} /> Выйти</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
