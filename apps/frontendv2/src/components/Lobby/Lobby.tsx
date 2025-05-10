import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import CreateRoomModal from '@/widgets/CreateRoom/CreateRoom'
import { ru } from '@lang/ru.ts'
import { en } from '@lang/en.ts'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en

export default function LobbyContent() {
    const [modalOpen, setModalOpen] = useState(false)
    const navigate = useNavigate()

    const handleCreateRoom = (roomId: string) => {
        // Просто переходим на комнату
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

            <p className="text-center text-gray-500 italic">
                {lang.lobby.noRoomsMessage}
            </p>

            <CreateRoomModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateRoom} // теперь приходит roomId
            />
        </div>
    )
}
