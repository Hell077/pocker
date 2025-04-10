import styles from "./PlayerSeat.module.css"

type Props = {
    index: number
    isActive?: boolean
}

const PlayerSeat = ({ index, isActive }: Props) => {
    return (
        <div className={`${styles.seat} ${isActive ? styles.active : ""}`}>
            <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=Player${index}`}
                className={styles.avatar}
            />
            <div className={styles.info}>Player {index}</div>
            <div className={styles.chips}>💰 {1000 - index * 100}</div>
            <div className={styles.hand}>
                <div className={styles.card} />
                <div className={styles.card} />
            </div>
        </div>
    )
}

export default PlayerSeat
