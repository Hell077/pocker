
import { motion } from "framer-motion";
import { useState } from "react";
import styles from "./PokerPage.module.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

type Player = {
    id: string;
    name: string;
    chips: number;
    folded: boolean;
};

export default function PokerTablePage() {
    const currentUserId = "player_own_id";

    const [players, setPlayers] = useState<Player[]>([
        { id: "player_own_id", name: "You", chips: 2500, folded: false },
        { id: "player2", name: "Player 2", chips: 1800, folded: false },
        { id: "player3", name: "Player 3", chips: 3200, folded: false },
        { id: "player4", name: "Player 4", chips: 4000, folded: false },
        { id: "player5", name: "Player 5", chips: 1500, folded: false },
        { id: "player6", name: "Player 6", chips: 2750, folded: false },
    ]);

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [isHeaderCollapsed, setHeaderCollapsed] = useState(false);
    const [isFooterCollapsed, setFooterCollapsed] = useState(false);
    const [bets, setBets] = useState<{ id: string; x: number; y: number }[]>([]);
    const [showRaiseModal, setShowRaiseModal] = useState(false);
    const [raiseAmount, setRaiseAmount] = useState(0);

    const toggleHeader = () => setHeaderCollapsed(!isHeaderCollapsed);
    const toggleFooter = () => setFooterCollapsed(!isFooterCollapsed);

    const handlePlayerAction = (action: string) => {
        if (action === "raise" || action === "bet") {
            setShowRaiseModal(true);
            return;
        }

        executeAction(action, 0);
    };

    const executeAction = (action: string, customAmount: number) => {
        setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            const player = updatedPlayers[currentPlayerIndex];

            if (!player || player.folded) return prevPlayers;

            switch (action) {
                case "fold":
                    player.folded = true;
                    break;
                case "check":
                    break;
                case "call":
                    if (player.chips >= currentBet) {
                        player.chips -= currentBet;
                        setPot(prev => prev + currentBet);
                        flyChip();
                    }
                    break;
                case "bet":
                case "raise":
                    if (player.chips >= customAmount) {
                        player.chips -= customAmount;
                        setCurrentBet(customAmount);
                        setPot(prev => prev + customAmount);
                        flyChip();
                    }
                    break;
                case "all-in":
                    const allInAmount = player.chips;
                    player.chips = 0;
                    setCurrentBet(Math.max(currentBet, allInAmount));
                    setPot(prev => prev + allInAmount);
                    flyChip();
                    break;
            }

            return updatedPlayers;
        });

        moveToNextPlayer();
    };

    const flyChip = () => {
        const randomOffsetX = Math.random() * 30 - 15;
        const randomOffsetY = Math.random() * 30 - 15;

        setBets(prev => [
            ...prev,
            { id: crypto.randomUUID(), x: 50 + randomOffsetX, y: 42 + randomOffsetY },
        ]);
    };

    const moveToNextPlayer = () => {
        setPlayers(prevPlayers => {
            const alivePlayers = prevPlayers.filter(p => !p.folded && p.chips > 0);
            if (alivePlayers.length === 1) {
                setWinnerId(alivePlayers[0].id);
            }
            return prevPlayers;
        });

        setCurrentPlayerIndex(prev => {
            let next = prev;
            do {
                next = (next + 1) % players.length;
            } while (players[next].folded || players[next].chips <= 0);

            return next;
        });
    };

    const handleConfirmRaise = () => {
        setShowRaiseModal(false);
        executeAction("raise", raiseAmount);
        setRaiseAmount(0);
    };

    const sortedPlayers = [
        ...players.filter(p => p.id === currentUserId),
        ...players.filter(p => p.id !== currentUserId).sort((a, b) => a.name.localeCompare(b.name)),
    ];

    return (
        <div className={styles.pageWrapper}>
            {/* HEADER */}
            <motion.div
                animate={{ height: isHeaderCollapsed ? 0 : "auto", opacity: isHeaderCollapsed ? 0 : 1 }}
                initial={false}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={styles.headerWrapper}
            >
                <Header />
            </motion.div>

            <button className={styles.headerToggleButton} onClick={toggleHeader}>
                {isHeaderCollapsed ? "⬇️" : "⬆️"}
            </button>

            {/* СТОЛ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className={styles.pokerTable}
            >
                <div className={styles.dealer}>DEALER</div>
                <div className={styles.potDisplay}>Pot: {pot} chips</div>

                {/* Игроки */}
                {sortedPlayers.map((player, index) => (
                    <motion.div
                        key={player.id}
                        className={`${styles.player} ${
                            players[currentPlayerIndex]?.id === player.id ? styles.activePlayer : ""
                        } ${winnerId === player.id ? styles.winner : ""}`}
                        style={getPlayerPosition(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                    >
                        <div className={styles.avatar}>{player.name}</div>
                        <div className={styles.chips}>{player.chips} chips</div>
                        <div className={styles.cardsOnHand}>
                            {player.id === currentUserId ? (
                                <>
                                    <motion.div className={styles.cardFace}>🂡</motion.div>
                                    <motion.div className={styles.cardFace}>🂱</motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div className={styles.cardBack} />
                                    <motion.div className={styles.cardBack} />
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Анимация фишек */}
                {bets.map(bet => (
                    <motion.div
                        key={bet.id}
                        className={styles.betChip}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            top: `${bet.y}%`,
                            left: `${bet.x}%`,
                        }}
                        transition={{ duration: 0.4 }}
                    />
                ))}
            </motion.div>

            {/* КНОПКИ */}
            {!winnerId && (
                <div className={styles.actionsPanel}>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("fold")}>Fold</button>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("check")}>Check</button>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("call")}>Call</button>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("raise")}>Raise</button>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("bet")}>Bet</button>
                    <button className={styles.actionButton} onClick={() => handlePlayerAction("all-in")}>All-In</button>
                </div>
            )}

            {/* FOOTER */}
            <motion.div
                animate={{ height: isFooterCollapsed ? 0 : "auto", opacity: isFooterCollapsed ? 0 : 1 }}
                initial={false}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={styles.footerWrapper}
            >
                <Footer />
            </motion.div>

            <button className={styles.footerToggleButton} onClick={toggleFooter}>
                {isFooterCollapsed ? "⬆️" : "⬇️"}
            </button>

            {/* МОДАЛКА Raise */}
            {showRaiseModal && (
                <div className={styles.raiseModal}>
                    <div className={styles.modalContent}>
                        <h3>Enter Raise Amount</h3>
                        <input
                            type="number"
                            value={raiseAmount}
                            onChange={e => setRaiseAmount(Number(e.target.value))}
                        />
                        <button onClick={handleConfirmRaise}>Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function getPlayerPosition(index: number) {
    const positions = [
        { top: "10%", left: "20%" },
        { top: "10%", right: "20%" },
        { left: "5%", top: "50%", transform: "translateY(-50%)" },
        { right: "5%", top: "50%", transform: "translateY(-50%)" },
        { bottom: "10%", left: "20%" },
        { bottom: "10%", right: "20%" },
    ];
    return positions[index] || {};
}
