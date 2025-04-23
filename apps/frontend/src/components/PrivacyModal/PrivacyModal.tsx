import React, { useEffect, useRef } from 'react';
import styles from './PrivacyModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const PrivacyModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
        <h2>Политика конфиденциальности</h2>
        <p><strong>Последнее обновление: 21 апреля 2025 г.</strong></p>

        <h3>1. Общие положения</h3>
        <p>Мы уважаем вашу конфиденциальность и стремимся обеспечить безопасность ваших данных. Настоящая политика описывает, как сайт PokerKingdom собирает, использует и защищает вашу информацию.</p>

        <h3>2. Сбор информации</h3>
        <ul>
          <li>Регистрационные данные: email, никнейм, пароль</li>
          <li>Технические данные: IP-адрес, устройство, браузер</li>
          <li>Игровая активность: участие в комнатах, действия игроков</li>
        </ul>

        <h3>3. Использование информации</h3>
        <p>Мы используем ваши данные для предоставления доступа к сайту, улучшения функциональности, защиты от мошенничества и внутренней аналитики.</p>

        <h3>4. Хранение и защита</h3>
        <p>Мы применяем технические меры защиты, но не можем гарантировать абсолютную безопасность.</p>

        <h3>5. Передача данных</h3>
        <p>Мы не передаём ваши данные третьим лицам, за исключением случаев, предусмотренных законодательством.</p>

        <h3>6. Cookies</h3>
        <p>Мы используем cookies для улучшения пользовательского опыта. Вы можете отключить их в настройках браузера.</p>

        <h3>7. Ваши права</h3>
        <p>Вы можете запросить удаление данных, изменить информацию или отозвать согласие на обработку.</p>

        <h3>8. Обновления</h3>
        <p>Мы можем вносить изменения в политику. Дата последнего обновления будет указываться вверху документа.</p>

        <h3>9. Контакты</h3>
        <p>Если у вас есть вопросы — напишите нам в <a href="http://t.me/yabous" target="_blank" rel="noopener noreferrer">Telegram</a>.</p>

        <p className={styles.notice}>
          📌 PokerKingdom — развлекательная платформа. Мы не обрабатываем платёжные данные или личные документы.
        </p>
      </div>
    </div>
  );
};

export default PrivacyModal;
