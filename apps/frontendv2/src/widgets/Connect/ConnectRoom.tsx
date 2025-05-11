import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'
import { useToast } from '@hooks/useToast.ts'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en

interface Props {
  isOpen: boolean
  onClose: () => void
  onConnect: (roomId: string) => void
}

export default function ConnectRoomModal({ isOpen, onClose, onConnect }: Props) {
  const [roomId, setRoomId] = useState('')
  const toast = useToast()

  const handleSubmit = () => {
    const trimmed = roomId.trim()
    if (!trimmed) {
      toast.error(lang.connectRoomModal.toastEmptyRoomId)
      return
    }

    onConnect(trimmed)
    setRoomId('')
    onClose()
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
          {lang.connectRoomModal.title}
        </h2>

        <div className="mb-6">
          <input
            type="text"
            placeholder={lang.connectRoomModal.roomIdPlaceholder}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-black border border-pink-500 rounded-lg px-4 py-2 outline-none text-white placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
        >
          {lang.connectRoomModal.connectButton}
        </button>
      </div>
    </div>
  )
}
