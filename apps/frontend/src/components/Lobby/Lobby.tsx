import { useState } from "react";
import styles from "./Lobby.module.css";
import { CreateRoomModal } from "../CreateRoomModal/CreateRoomModal";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BadgeDollarSign, Gamepad2, Clock } from "lucide-react";

type Room = {
    roomId: string;
    limits: number;
    type: string;
    maxPlayers: number;
    status: string;
    name: string;
};

type CreateRoomInput = Pick<Room, "maxPlayers" | "limits" | "name">;

const Lobby = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("none");
    const navigate = useNavigate();

    const handleCreate = ({ maxPlayers, limits, name }: CreateRoomInput) => {
        const newRoom: Room = {
            roomId: Math.random().toString(36).substring(2, 10),
            limits,
            type: "cash",
            maxPlayers,
            status: "waiting",
            name,
        };
        setRooms((prev) => [...prev, newRoom]);
        setModalOpen(false);
    };

    const filtered = rooms
        .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortOption === "limits") return a.limits - b.limits;
            if (sortOption === "players") return a.maxPlayers - b.maxPlayers;
            return 0;
        });

    return (
        <div className={styles.lobby}>
            <div className={styles.lobbyHeader}>
                <h1 className={styles.title}>Poker Lobby</h1>
                <div className={styles.topBar}>
                    <div className={styles.controls}>
                        <input
                            className={styles.search}
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className={styles.select}
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="none">No Sort</option>
                            <option value="limits">Sort by Bet</option>
                            <option value="players">Sort by Players</option>
                        </select>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={() => setModalOpen(true)}
                    >
                        ➕ Create Room
                    </button>
                </div>
            </div>

            {modalOpen && (
                <CreateRoomModal
                    onClose={() => setModalOpen(false)}
                    onCreate={handleCreate}
                />
            )}

            {filtered.length === 0 ? (
                <p className={styles.emptyMessage}>
                    🎲 No rooms yet. Be the first to create one!
                </p>
            ) : (
                <div className={styles.roomWrapper}>
                    <div className={styles.roomList}>
                        <AnimatePresence>
                            {filtered.map((room) => (
                                <motion.div
                                    key={room.roomId}
                                    className={styles.roomCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <p><Gamepad2 size={16} className={styles.icon} /><strong>Name:</strong> {room.name}</p>
                                    <p><Users size={16} className={styles.icon} /><strong>Players:</strong> {room.maxPlayers}</p>
                                    <p><BadgeDollarSign size={16} className={styles.icon} /><strong>Bet:</strong> {room.limits}</p>
                                    <p><Clock size={16} className={styles.icon} /><strong>Status:</strong>
                                        <span className={`${styles.badge} ${styles[room.status]}`}>{room.status}</span>
                                    </p>
                                    <button onClick={() => navigate(`/table/${room.roomId}`)}>
                                        Join Room
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;
