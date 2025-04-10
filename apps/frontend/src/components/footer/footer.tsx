// components/Footer.tsx
import React from 'react';
import styles from './PockerFooter.module.css';
import '../../root/root.css';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={styles.logo}>♠ PokerKingdom</div>

                <nav className={styles.nav}>
                    <a href="#">Главная</a>
                    <a href="#">Турниры</a>
                    <a href="#">Правила</a>
                    <a href="#">Поддержка</a>
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
