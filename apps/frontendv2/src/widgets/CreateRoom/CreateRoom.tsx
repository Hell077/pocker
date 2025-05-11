import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'
import { API_URL } from '@/env/api.ts'
import { useToast } from '@hooks/useToast'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en

interface Props {
    isOpen: boolean
    onClose: () => void
    onCreate: (roomId: string) => void
}

const GAME_TYPES = ['cash', 'sitngo', 'mtt'] as const
type GameType = typeof GAME_TYPES[number]

export default function CreateRoomModal({ isOpen, onClose, onCreate }: Props) {
    const [roomName, setRoomName] = useState('')
    const [maxPlayers, setMaxPlayers] = useState(2)
    const [smallBlind, setSmallBlind] = useState(1)
    const [bigBlind, setBigBlind] = useState(2)
    const [gameType, setGameType] = useState<GameType>('cash')
    const toast = useToast()

    const handleSubmit = async () => {
        if (
          !roomName.trim() ||
          maxPlayers < 2 ||
          maxPlayers > 5 ||
          smallBlind <= 0 ||
          bigBlind <= smallBlind
        ) {
            toast.error(lang.createRoomModal.toastInvalidForm || 'Проверьте корректность введённых данных')
            return
        }

        try {
            const token = localStorage.getItem('accessToken')

            const res = await fetch(`${API_URL}/room/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    limits: `${smallBlind}/${bigBlind}`,
                    max_players: maxPlayers,
                    type: gameType,
                    name: roomName.trim(),
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

            if (!res.ok || !data || !data.room_id) {
                throw new Error('Ошибка при создании комнаты')
            }

            toast.success(lang.createRoomModal.toastCreated || 'Комната успешно создана!')
            onCreate(data.room_id)

            onClose()
            setRoomName('')
            setMaxPlayers(2)
            setSmallBlind(1)
            setBigBlind(2)
            setGameType('cash')
        } catch (err) {
            console.error('❌ Ошибка при создании комнаты:', err)
            toast.error(lang.createRoomModal.toastCreateError || 'Не удалось создать комнату. Попробуйте позже.')
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
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
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
                  <p className="mb-2 text-sm text-gray-300">{lang.createRoomModal.smallBlind}</p>
                  <input
                    type="number"
                    min={1}
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(Number(e.target.value))}
                    className="w-full bg-black border border-pink-500 rounded-lg px-4 py-2 outline-none text-white placeholder-gray-400"
                    placeholder="Small Blind"
                  />
              </div>

              <div className="mb-6">
                  <p className="mb-2 text-sm text-gray-300">{lang.createRoomModal.bigBlind}</p>
                  <input
                    type="number"
                    min={smallBlind + 1}
                    value={bigBlind}
                    onChange={(e) => setBigBlind(Number(e.target.value))}
                    className="w-full bg-black border border-pink-500 rounded-lg px-4 py-2 outline-none text-white placeholder-gray-400"
                    placeholder="Big Blind"
                  />
              </div>

              <div className="mb-6">
                  <p className="mb-2 text-sm text-gray-300">{lang.createRoomModal.gameTypeLabel}</p>
                  <div className="grid grid-cols-3 gap-2">
                      {GAME_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setGameType(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                            gameType === type
                              ? 'bg-pink-600 border-pink-500 text-white'
                              : 'bg-black border-gray-600 text-gray-300'
                          }`}
                        >
                            {lang.createRoomModal[`gameType_${type}` as `gameType_${GameType}`]}
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
