import styles from './BalanceCard.module.css'; // Импортируем стили

interface Props {
    chips: number;
}

export default function ChipsCard({ chips }: Props) {
    return (
        <div className={styles.chipsCard}>
            <div>
                <p className={styles.chipsTitle}>Current Chips</p>
                <h2 className={styles.chipsValue}>{chips.toLocaleString()}</h2>
            </div>
            <svg className={styles.icon} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12L12 5L19 12" stroke="#ff2e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}
