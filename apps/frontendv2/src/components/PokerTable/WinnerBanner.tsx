import { useEffect, useState } from 'react'

interface WinnerPayload {
  nickname: string
  amount: number
}

const WinnerModal = () => {
  const [winner, setWinner] = useState<WinnerPayload | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'winner-announced') {
        setWinner(data.payload)
        setVisible(true)

        setTimeout(() => {
          setVisible(false)
          setWinner(null)
        }, 7000)
      }
    }

    return () => ws.close()
  }, [])

  if (!visible || !winner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-yellow-500 via-red-500 to-pink-500 text-white rounded-xl shadow-2xl p-8 w-[90%] max-w-md animate-fadeIn scale-105">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">🏆 Победитель раунда!</h2>
          <p className="text-2xl">
            <span className="font-semibold">{winner.nickname}</span> выигрывает
          </p>
          <p className="text-4xl font-extrabold text-yellow-200 drop-shadow">
            {winner.amount} фишек 💰
          </p>
          <button
            onClick={() => setVisible(false)}
            className="mt-4 px-6 py-2 bg-black/50 hover:bg-black/70 rounded-lg transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinnerModal
