import React, { useState } from "react";
import { Coins, X } from "lucide-react";
import styles from "./CreateRoomModal.module.css";

type Props = {
    onClose: () => void;
    onCreate: (options: {
        maxPlayers: number;
        limits: string;
        name: string;
    }) => void;
};

const chipOptions = ["100", "200", "500", "1000", "5000"];

export const CreateRoomModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [limits, setLimits] = useState("100");
    const [name, setName] = useState("");

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <h2>Create Poker Room</h2>

                <label>Room Name</label>
                <input
                    type="text"
                    placeholder="Enter room name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label>Players</label>
                <div className={styles.optionGrid}>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                            key={num}
                            className={`${styles.optionButton} ${
                                maxPlayers === num ? styles.selected : ""
                            }`}
                            onClick={() => setMaxPlayers(num)}
                            title={`Set max players to ${num}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <label>Minimum Bet</label>
                <div className={styles.optionGrid}>
                    {chipOptions.map((chip) => (
                        <button
                            key={chip}
                            className={`${styles.optionButton} ${
                                limits === chip ? styles.selected : ""
                            }`}
                            onClick={() => setLimits(chip)}
                            title={`Set minimum bet to ${chip}`}
                        >
                            <Coins className={styles.icon} /> {chip}
                        </button>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancel} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.confirm}
                        onClick={() => onCreate({ maxPlayers, limits, name })}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};
