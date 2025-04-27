import styles from './SkeletonCard.module.css'; // Импортируем стили

export function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
        </div>
    );
}
