import React from 'react';
import styles from './PockerHeader.module.css';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {
    onLoginClick: () => void;
    onGoHome: () => void;
}

const Header: React.FC<Props> = ({ onLoginClick, onGoHome }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (location.pathname === "/") {
            onGoHome();
        } else {
            navigate("/");
        }
    };

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
                <div onClick={handleGoHome} className={styles.logo} style={{ cursor: 'pointer' }}>
                    ♠ PokerKingdom
                </div>

                <nav className={styles.nav}>
                    <a onClick={handleGoHome} className={styles.link} style={{ cursor: 'pointer' }}>
                        Home
                    </a>
                    <a onClick={() => navigate("/tournaments")} className={styles.link} style={{ cursor: 'pointer' }}>
                        Tournaments
                    </a>
                    <a onClick={() => navigate("/leaderboard")} className={styles.link} style={{ cursor: "pointer" }}>
                        Leaderboard
                    </a>
                </nav>

                <div className={styles.rightSide}>
                    {!user ? (
                        <button className={styles.loginBtn} onClick={onLoginClick}>Войти</button>
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
                                    <a onClick={() => navigate("/profile")}><User size={16} /> Профиль</a>
                                    <a onClick={() => navigate("/settings")}><Settings size={16} /> Настройки</a>
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
