
import { useEffect, useState } from 'react'
import winSound from './assets/sounds/win.mp3'

interface Props {
  winnerName: string
}

export default function WinnerBanner({ winnerName }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500)
    const sound = new Audio(winSound)
    sound.play()
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 text-center text-yellow-400 text-4xl font-bold animate-bounce">
      🥇 {winnerName} Wins!
    </div>
  )
}
