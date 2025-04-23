import React, { useEffect, useRef } from 'react';
import styles from './TermsModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TermsModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
        <h2>Условия использования PokerKingdom</h2>
        <p><strong>Последнее обновление: 21 апреля 2025 г.</strong></p>

        <h3>1. Общие положения</h3>
        <p>Сайт предоставляет доступ к онлайн-игре в покер исключительно в развлекательных целях. Используя сайт, вы подтверждаете, что согласны с настоящими условиями.</p>

        <h3>2. Регистрация и аккаунт</h3>
        <p>Для доступа к игровым функциям может потребоваться регистрация. Вы обязуетесь предоставлять корректную и актуальную информацию. Администрация имеет право заблокировать аккаунт в случае нарушений.</p>

        <h3>3. Правила поведения</h3>
        <ul>
          <li>Запрещено использование ботов или скриптов.</li>
          <li>Запрещены оскорбления, спам и токсичное поведение.</li>
          <li>Запрещены попытки мошенничества или взлома.</li>
        </ul>
        <p>Соблюдайте честную игру и уважайте других участников.</p>

        <h3>4. Ограничение ответственности</h3>
        <p>Сервис предоставляется "как есть", без каких-либо гарантий. Мы не несём ответственности за возможные сбои, потерю данных или последствия использования сайта.</p>

        <h3>5. Изменения условий</h3>
        <p>Мы оставляем за собой право изменить настоящие условия в любое время. Продолжая использовать сайт после изменений, вы автоматически соглашаетесь с ними.</p>

        <h3>6. Контакты</h3>
        <p>Если у вас есть вопросы — напишите нам в <a href="http://t.me/yabous" target="_blank" rel="noopener noreferrer">Telegram</a>.</p>

        <p className={styles.notice}>
          ⚠️ PokerKingdom — это не сервис с реальными денежными ставками. Все действия на сайте являются виртуальными и не имеют финансовой ценности.
        </p>
      </div>
    </div>
  );
};

export default TermsModal;
