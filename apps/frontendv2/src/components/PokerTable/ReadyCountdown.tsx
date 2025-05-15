import { useEffect, useState } from 'react'

const ReadyCountdown = ({
                          seconds = 10,
                          onComplete,
                        }: {
  seconds?: number
  onComplete?: () => void
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onComplete])
  console.log('Таймер запущен:', timeLeft)

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 text-yellow-300 text-4xl font-bold bg-black/80 px-6 py-2 rounded-xl border border-yellow-500 shadow-xl">
      Игра начнется через {timeLeft}...
    </div>
  )
}

export default ReadyCountdown
