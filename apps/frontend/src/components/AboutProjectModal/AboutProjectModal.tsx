import React, { useEffect, useRef } from 'react';
import styles from './AboutProjectModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AboutProjectModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClickOutside}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>🧠 О проекте PokerKingdom</h2>
        <p>
          PokerKingdom — это стильный, атмосферный покерный сервис,
          созданный с душой и вниманием к деталям. Мы вдохновлены идеей
          объединить технологии и эстетику в уникальной неоновой вселенной ♠.
        </p>
        <p>
          Здесь нет ставок на деньги, только дух соревнования,
          честной игры и технологической красоты.
        </p>
        <p>
          Бэкенд: Go + Temporal + PostgreSQL<br />
          Фронт: React + TypeScript + CSS-модули<br />
          UI: чистый неон с 💖
        </p>
        <p className={styles.notice}>
          Создано энтузиастами — для настоящих игроков.
        </p>
      </div>
    </div>
  );
};

export default AboutProjectModal;
