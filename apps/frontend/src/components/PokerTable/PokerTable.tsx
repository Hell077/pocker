import styles from "./PokerTable.module.css"
import PlayerSeat from "../PlayerSeat/PlayerSeat"
import DealerSeat from "../DealerSeat/DealerSeat"

const PokerTable = () => {
    return (
        <div className={styles.table}>
            <div className={styles.players}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <PlayerSeat key={i} index={i + 1} isActive={i === 2} /> {/* Пример активного игрока */}
                    ))}
            </div>
            <div className={styles.dealer}>
                <DealerSeat />
            </div>
            <div className={styles.cards}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.card} />
                ))}
            </div>
            <div className={styles.actions}>
                <button className={styles.actionBtn}>Call</button>
                <button className={styles.actionBtn}>Raise</button>
                <button className={styles.actionBtn}>Fold</button>
            </div>
        </div>
    )
}

export default PokerTable
