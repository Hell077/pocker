import React from 'react';
import styles from './PockerHeader.module.css';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface Props {
    onLoginClick: () => void;
}

const Header: React.FC<Props> = ({ onLoginClick }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`.${styles.dropdownWrapper}`)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>♠ PokerKingdom</div>

                <nav className={styles.nav}>
                    <a href="#" className={styles.link}>Home</a>
                    <a href="#" className={styles.link}>Tournaments</a>
                    <a href="#" className={styles.link}>Leaderboard</a>
                </nav>

                <div className={styles.rightSide}>
                    {!user ? (
                        <>
                            <button className={styles.loginBtn} onClick={onLoginClick}>Войти</button>
                            <button className={styles.registerBtn} onClick={onLoginClick}>Зарегистрироваться</button>
                        </>
                    ) : (
                        <>
                            <div className={styles.balance}>💰 {user.balance.toLocaleString()}</div>
                            <div className={styles.dropdownWrapper}>
                                <div onClick={toggleMenu} className={styles.user}>
                                    <img src={user.avatarUrl} alt="Avatar" className={styles.avatar} />
                                    <span className={styles.username}>{user.username}</span>
                                    <ChevronDown size={16} />
                                </div>
                                <div className={`${styles.dropdown} ${isMenuOpen ? styles.show : ''}`}>
                                    <a href="#"><User size={16} /> Профиль</a>
                                    <a href="#"><Settings size={16} /> Настройки</a>
                                    <a onClick={logout}><LogOut size={16} /> Выйти</a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
