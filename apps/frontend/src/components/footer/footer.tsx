import React, { useState } from 'react';
import styles from './PockerFooter.module.css';
import '../../root/root.css';
import { Instagram, Youtube, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import TermsModal from '../TermsModal/TermsModal';
import PrivacyModal from '../PrivacyModal/PrivacyModal';
import AboutProjectModal from '../AboutProjectModal/AboutProjectModal';

type Props = {
    onRulesClick: () => void;
    onGoHome: () => void;
};

const Footer: React.FC<Props> = ({ onRulesClick, onGoHome }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [termsOpen, setTermsOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

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
      <>
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
                      <a href="https://www.instagram.com/aur1el0/" target="_blank" rel="noopener noreferrer">
                          <Instagram size={18} />
                      </a>
                      <a href="http://t.me/yabous" target="_blank" rel="noopener noreferrer">
                          <Send size={18} />
                      </a>
                      <a href="https://www.youtube.com/watch?v=UvCSQirMvMw&ab_channel=%D0%A1%D0%A2%D0%95%D0%9D%D0%90%D0%A1%D0%9E%D0%91%D0%AB%D0%A2%D0%98%D0%99" target="_blank" rel="noopener noreferrer">
                          <Youtube size={18} />
                      </a>
                  </div>
              </div>

              <div className={styles.bottom}>
                  <span>© {new Date().getFullYear()} PokerKingdom. Все права защищены.</span>
                  <div className={styles.legal}>
                      <a style={{ cursor: 'pointer' }} onClick={() => setPrivacyOpen(true)}>
                          Политика конфиденциальности
                      </a>
                      <a style={{ cursor: 'pointer' }} onClick={() => setTermsOpen(true)}>
                          Условия использования
                      </a>
                      <a className={styles.aboutLink} onClick={() => setAboutOpen(true)}>
                          🛈 О проекте
                      </a>
                  </div>
              </div>
          </footer>

          <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
          <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
          <AboutProjectModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      </>
    );
};

export default Footer;
