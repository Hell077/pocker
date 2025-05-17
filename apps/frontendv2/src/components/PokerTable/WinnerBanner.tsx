import { useEffect, useState } from 'react'
import { useGameContext } from './GameStateContext'

export const WinnerModal = () => {
  const { winnerPayload, setWinnerPayload } = useGameContext()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (winnerPayload) {
      setVisible(true)
      const timeout = setTimeout(() => {
        setVisible(false)
        setWinnerPayload(null)
      }, 7800)

      return () => clearTimeout(timeout)
    }
  }, [winnerPayload])

  if (!visible || !winnerPayload) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-yellow-500 via-red-500 to-pink-500 text-white rounded-xl shadow-2xl p-8 w-[90%] max-w-md animate-fadeIn scale-105">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Победитель раунда!</h2>
          <p className="text-2xl">
            <span className="font-semibold">{winnerPayload.nickname}</span> выигрывает
          </p>
          <p className="text-4xl font-extrabold text-yellow-200 drop-shadow">
            {winnerPayload.amount} фишек 💰
          </p>
          <button
            onClick={() => {
              setVisible(false)
              setWinnerPayload(null)
            }}
            className="mt-4 px-6 py-2 bg-black/50 hover:bg-black/70 rounded-lg transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
