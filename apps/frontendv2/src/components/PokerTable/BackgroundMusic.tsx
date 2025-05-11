
import { useEffect } from 'react'
import ambient from './assets/sounds/ambient.mp3'

export default function BackgroundMusic() {
  useEffect(() => {
    const audio = new Audio(ambient)
    audio.loop = true
    audio.volume = 0.25
    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  return null
}
