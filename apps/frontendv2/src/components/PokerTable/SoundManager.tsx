import { useEffect } from 'react'

const SoundManager = () => {
    useEffect(() => {
        const playSound = (src: string) => {
            const audio = new Audio(src)
            audio.volume = 0.5
            audio.play().catch(() => {})
        }

        const handleEvent = (e: CustomEvent<string>) => {
            playSound(e.detail)
        }

        window.addEventListener('play-sound', handleEvent as EventListener)

        return () => {
            window.removeEventListener('play-sound', handleEvent as EventListener)
        }
    }, [])

    return null
}

export default SoundManager
