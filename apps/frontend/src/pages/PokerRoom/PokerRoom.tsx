import PokerTable from "../../components/PokerTable/PokerTable"
import styles from "./PokerRoom.module.css"

const PokerRoom = () => {
    return (
        <div className={styles.roomWrapper}>
            <PokerTable />
        </div>
    )
}

export default PokerRoom
