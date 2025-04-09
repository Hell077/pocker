import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Lobby.module.css'; // Импортируем модульный CSS

const tables = [
    { id: 1, name: '🔥 High Rollers', players: 6, maxPlayers: 9 },
    { id: 2, name: '♠ Casual Poker', players: 3, maxPlayers: 6 },
    { id: 3, name: '💼 Business Table', players: 2, maxPlayers: 5 },
];

const Lobby: React.FC = () => {
    const [activeTables, setActiveTables] = useState(tables);

    const createTable = () => {
        const newTable = { id: activeTables.length + 1, name: 'New Table', players: 0, maxPlayers: 6 };
        setActiveTables([...activeTables, newTable]);
    };

    return (
        <div className={styles.lobbyWrapper}> {/* Используем классы из модульного CSS */}
            <h1 className={styles.title}>🎴 Poker Lobby</h1>
            <p className={styles.subtitle}>Выбери стол или создай свой</p>

            <div className={styles.tableList}>
                {activeTables.map((table) => (
                    <div key={table.id} className={styles.tableCard}>
                        <h2 className={styles.tableName}>{table.name}</h2>
                        <p className={styles.players}>
                            Игроков: {table.players} / {table.maxPlayers}
                        </p>
                        <Link to={`/room/${table.id}`} className={styles.joinBtn}>Присоединиться</Link>
                    </div>
                ))}
            </div>

            <button className={styles.createBtn} onClick={createTable}>➕ Создать стол</button>
        </div>
    );
};

export default Lobby;
