import flipSoundSrc from '@/assets/sounds/card-flip.mp3'
import chipSoundSrc from '@/assets/sounds/chips.mp3'
import winSoundSrc from '@/assets/sounds/win.mp3'

const flipSound = new Audio(flipSoundSrc)
const chipSound = new Audio(chipSoundSrc)
const winSound = new Audio(winSoundSrc)

export const SoundManager = {
  playFlip: () => {
    flipSound.currentTime = 0
    void flipSound.play().catch(() => {}) // исправление promise
  },
  playChips: () => {
    chipSound.currentTime = 0
    void chipSound.play().catch(() => {})
  },
  playWin: () => {
    winSound.currentTime = 0
    void winSound.play().catch(() => {})
  },
}
