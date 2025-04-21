import styles from "./Leaderboard.module.css";

const players = [
    { nickname: "AceHigh", games: 42, wins: 20, chips: 12500 },
    { nickname: "PocketKing", games: 38, wins: 22, chips: 11800 },
    { nickname: "Lucky7", games: 45, wins: 18, chips: 11500 },
    { nickname: "RiverBluff", games: 30, wins: 12, chips: 9000 },
    { nickname: "FullHouse", games: 25, wins: 10, chips: 8200 },
];

export const Leaderboard = () => {
    return (
        <div className={styles.container}>
            <div className={styles.podium}>
                {players.slice(0, 3).map((player, index) => (
                    <div key={player.nickname} className={`${styles.podiumSlot} ${styles[`place${index + 1}`]}`}>
                        <div className={styles.nickname}>{player.nickname}</div>
                        <div className={styles.chips}>{player.chips} 🪙</div>
                        <div className={styles.position}>#{index + 1}</div>
                    </div>
                ))}
            </div>

            <div className={styles.table}>
                <div className={styles.header}>
                    <span>Nickname</span>
                    <span>Games</span>
                    <span>Wins</span>
                    <span>Chips</span>
                </div>

                {players.map((player) => (
                    <div key={player.nickname} className={styles.row}>
                        <span>{player.nickname}</span>
                        <span>{player.games}</span>
                        <span>{player.wins}</span>
                        <span>{player.chips}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
