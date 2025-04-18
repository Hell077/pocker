import React, { useState } from "react";
import styles from "./lobby.module.css";
import { CreateRoomModal } from "../CreateRoomModal/CreateRoomModal";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ добавили framer-motion

type Room = {
    room_id: string;
    limits: string;
    type: string;
    max_players: number;
    status: string;
    name: string;
};

const Lobby: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleCreate = ({
                              maxPlayers,
                              limits,
                              name,
                          }: {
        maxPlayers: number;
        limits: string;
        name: string;
    }) => {
        const fakeRoomId = Math.random().toString(36).substring(2, 10);
        const newRoom: Room = {
            room_id: fakeRoomId,
            limits,
            type: "cash",
            max_players: maxPlayers,
            status: "waiting",
            name,
        };

        setRooms((prev) => [...prev, newRoom]);
        setModalOpen(false);
    };

    const sortedRooms = [...rooms].sort(
        (a, b) => parseInt(a.limits) - parseInt(b.limits)
    );

    return (
        <div className={styles.lobby}>
            <h1>Poker Lobby</h1>

            <button className={styles.createButton} onClick={() => setModalOpen(true)}>
                ➕ Create Room
            </button>

            {modalOpen && (
                <CreateRoomModal
                    onClose={() => setModalOpen(false)}
                    onCreate={handleCreate}
                />
            )}

            {rooms.length === 0 ? (
                <p className={styles.emptyMessage}>No rooms available</p>
            ) : (
                <div className={styles.roomList}>
                    <AnimatePresence>
                        {sortedRooms.map((room) => (
                            <motion.div
                                key={room.room_id}
                                className={styles.roomCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p><strong>Name:</strong> {room.name}</p>
                                <p><strong>Players:</strong> {room.max_players}</p>
                                <p><strong>Bet:</strong> {room.limits}</p>
                                <p><strong>Status:</strong> {room.status}</p>
                                <button onClick={() => navigate(`/table/${room.room_id}`)}>
                                    Join Room
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Lobby;
