import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import CreateRoomModal from '@/widgets/CreateRoom/CreateRoom'
import { ru } from '@lang/ru.ts';
import { en } from '@lang/en.ts';

interface Room {
    id: string
    name: string
    players: number
    maxPlayers: number
    stakes: number
}

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en


export default function LobbyContent() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const navigate = useNavigate()

    const handleCreateRoom = (newRoom: { name: string; maxPlayers: number; stakes: number }) => {
        const id = Date.now().toString()
        setRooms((prev) => [
            ...prev,
            {
                id,
                name: newRoom.name,
                players: 0,
                maxPlayers: newRoom.maxPlayers,
                stakes: newRoom.stakes,
            },
        ])
    }

    const handleJoin = (roomId: string) => {
        navigate(`/table/${roomId}`)
    }

    return (
        <div>
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-4xl font-bold text-pink-500 mb-4 text-center">{lang.lobby.pokerLobby}</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">{lang.lobby.createTableDescription}</p>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-pink-600 hover:bg-pink-700 rounded-xl shadow-md transition"
                >
                    <FaPlus />
                    {lang.lobby.createRoomButton}
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-white/10 backdrop-blur-lg border border-pink-500 rounded-xl p-6 shadow-md hover:shadow-pink-500/30 transition-transform hover:scale-105"
                    >
                        <h2 className="text-xl font-bold text-pink-400 mb-1">{room.name}</h2>
                        <p className="text-sm text-gray-300 mb-1">{lang.lobby.bet}: {room.stakes}</p>
                        <p className="text-sm text-gray-400 mb-4">{lang.lobby.players}: {room.players} / {room.maxPlayers}</p>
                        <button
                            onClick={() => handleJoin(room.id)}
                            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                            {lang.lobby.join}
                        </button>
                    </div>
                ))}
            </div>

            <CreateRoomModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateRoom}
            />
        </div>
    )
}
