import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en

const API_URL = window.ENV?.VITE_API_URL || 'http://localhost:8000/api'

interface Props {
    isOpen: boolean
    onClose: () => void
    onCreate: (roomId: string) => void
}

export default function CreateRoomModal({ isOpen, onClose, onCreate }: Props) {
    const [name, setName] = useState('')
    const [maxPlayers, setMaxPlayers] = useState(2)
    const [stakes, setStakes] = useState(100)

    const handleSubmit = async () => {
        if (!name.trim() || maxPlayers < 2 || maxPlayers > 5 || !stakes) return

        try {
            const token = localStorage.getItem('accessToken')

            const res = await fetch(`${API_URL}/room/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    room: {
                        limits: stakes.toString(),
                        max_players: maxPlayers,
                        type: name.trim(),
                    },
                }),
            })

            const raw = await res.text()
            console.log('🧾 Response status:', res.status)
            console.log('📦 Raw response:', raw)

            let data
            try {
                data = JSON.parse(raw)
            } catch {
                data = {}
            }

            console.log('✅ Parsed JSON:', data)

            if (!res.ok || !data || !data.id) {
                throw new Error('Ошибка при создании комнаты')
            }

            onCreate(data.id)
            onClose()
            setName('')
            setMaxPlayers(2)
            setStakes(100)
        } catch (err) {
            console.error('❌ Ошибка при создании комнаты:', err)
            alert('Не удалось создать комнату. Попробуйте позже.')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-pink-500 rounded-2xl p-8 w-full max-w-md shadow-xl text-white relative">
                <button
                    className="absolute top-4 right-4 text-pink-500 hover:text-pink-400 transition"
                    onClick={onClose}
                >
                    <FaTimes size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-pink-400 text-center">
                    {lang.createRoomModal.title}
                </h2>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={lang.createRoomModal.roomNamePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black border border-pink-500 rounded-lg px-4 py-2 outline-none text-white placeholder-gray-400"
                    />
                </div>

                <div className="mb-6">
                    <p className="mb-2 text-sm text-gray-300">{lang.createRoomModal.playersCountLabel}</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => setMaxPlayers(num)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                                    maxPlayers === num
                                        ? 'bg-pink-600 border-pink-500 text-white'
                                        : 'bg-black border-gray-600 text-gray-300'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="mb-2 text-sm text-gray-300">{lang.createRoomModal.stakesLabel}</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[100, 500, 1000, 2500, 5000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setStakes(amount)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                                    stakes === amount
                                        ? 'bg-pink-600 border-pink-500 text-white'
                                        : 'bg-black border-gray-600 text-gray-300'
                                }`}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
                >
                    {lang.createRoomModal.createButton}
                </button>
            </div>
        </div>
    )
}
