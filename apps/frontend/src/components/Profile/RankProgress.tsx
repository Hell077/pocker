import styles from './RankProgress.module.css'; // Импортируем стили

interface Props {
    level: number;
    currentExp: number;
    nextLevelExp: number;
}

export default function RankProgress({ level, currentExp, nextLevelExp }: Props) {
    const percentage = (currentExp / nextLevelExp) * 100;

    return (
        <div className={styles.rankProgress}>
            <div className={styles.rankInfo}>
                <span>Level {level}</span>
                <span>{currentExp}/{nextLevelExp} XP</span>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={styles.progress}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
