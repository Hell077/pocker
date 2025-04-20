import React from 'react';
import styles from './PockerFooter.module.css';
import '../../root/root.css';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
    onRulesClick: () => void;
    onGoHome: () => void;
};

const Footer: React.FC<Props> = ({ onRulesClick, onGoHome }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (location.pathname === "/") {
            onGoHome();
        } else {
            navigate("/");
        }
    };

    const handleRulesClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onRulesClick();
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={styles.logo} onClick={handleGoHome} style={{ cursor: 'pointer' }}>
                    ♠ PokerKingdom
                </div>

                <nav className={styles.nav}>
                    <a onClick={handleRulesClick} style={{ cursor: 'pointer' }}>
                        Правила
                    </a>
                </nav>

                <div className={styles.socials}>
                    <a href="#"><Instagram size={18} /></a>
                    <a href="#"><Twitter size={18} /></a>
                    <a href="#"><Youtube size={18} /></a>
                </div>
            </div>

            <div className={styles.bottom}>
                <span>© {new Date().getFullYear()} PokerKingdom. Все права защищены.</span>
                <div className={styles.legal}>
                    <a href="#">Политика конфиденциальности</a>
                    <a href="#">Условия использования</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
