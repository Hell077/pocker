import { useCallback, useEffect, useRef, useState } from 'react'
import { authFetch } from '@/utils/authFetch'
import { useToast } from '@/hooks/useToast'
import { formatSecondsToTime } from '@/utils/time'

interface RewardItem {
    Reward: number
}

const COLORS = [
    '#ffd700', '#c0c0c0', '#cd7f32', '#e0115f', '#4169e1', '#3cb371', '#ff4500', '#8a2be2',
    '#00ced1', '#fa8072', '#ff8c00', '#7fffd4', '#ff1493', '#20b2aa', '#ff6347', '#dda0dd', '#add8e6', '#90ee90', '#ff69b4', '#1e90ff'
]

export default function FortuneWheel() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [segments, setSegments] = useState<string[]>([])
    const [angle, setAngle] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const { success, error, warning } = useToast()
    const SEGMENT_ANGLE = 360 / segments.length

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || segments.length === 0) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const size = canvas.width
        const radius = size / 2
        ctx.clearRect(0, 0, size, size)
        ctx.save()
        ctx.translate(radius, radius)
        ctx.rotate((angle * Math.PI) / 180)

        segments.forEach((label, i) => {
            const startAngle = (i * SEGMENT_ANGLE * Math.PI) / 180
            const endAngle = ((i + 1) * SEGMENT_ANGLE * Math.PI) / 180

            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, radius, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = COLORS[i % COLORS.length]
            ctx.fill()
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.save()
            ctx.rotate(startAngle + (SEGMENT_ANGLE * Math.PI) / 360)
            ctx.fillStyle = 'white'
            ctx.font = 'bold 14px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${label}$`, radius * 0.65, 0)
            ctx.restore()
        })

        ctx.restore()
    }, [angle, segments, SEGMENT_ANGLE])

    const loadWheelData = useCallback(() => {
        authFetch(`${API_URL}/daily-reward/wheel`)
          .then(res => res.json())
          .then((data) => {
              if (!Array.isArray(data.Items)) throw new Error('Неверный формат данных')
              setSegments(data.Items.map((item: RewardItem) => `${item.Reward}`))
          })
          .catch(err => {
              console.error('Ошибка загрузки сегментов:', err)
              error('Не удалось загрузить список наград')
          })
    }, [API_URL, error])

    useEffect(() => {
        loadWheelData()
    }, [loadWheelData])

    useEffect(() => {
        drawWheel()
    }, [drawWheel])

    const claimReward = async () => {
        try {
            const res = await authFetch(`${API_URL}/daily-reward`, {
                method: 'POST'
            })
            const data = await res.json()
            success(`Получено: ${data.amount}$ 🎉`)
        } catch (err) {
            console.error('Error claiming reward:', err)
            error('Ошибка при получении награды')
        }
    }

    const spinWheel = async () => {
        if (spinning || segments.length === 0) return

        try {
            const res = await authFetch(`${API_URL}/daily-reward/cooldown`)
            const data = await res.json()

            if (data.cooldown_seconds > 0) {
                const formatted = formatSecondsToTime(data.cooldown_seconds)
                warning(`Следующее вращение через ${formatted}`)
                return
            }
        } catch (err) {
            console.error('Ошибка проверки cooldown:', err)
            error('Ошибка при проверке возможности вращения')
            return
        }

        setSpinning(true)
        const fullSpins = 8
        const randomTarget = Math.random() * 360
        const total = fullSpins * 360 + randomTarget
        const start = performance.now()
        const duration = 5000

        const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 5)
            const current = angle + (total - angle) * ease
            setAngle(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                const normalized = (360 - ((current % 360 + 360) % 360)) % 360
                const index = Math.floor((normalized + SEGMENT_ANGLE / 2) / SEGMENT_ANGLE) % segments.length
                const rewardValue = segments[index]
                setResult(rewardValue)
                claimReward()
                setSpinning(false)
            }
        }

        requestAnimationFrame(animate)
    }

    return (
      <div className="flex flex-col items-center justify-center gap-10">
          <div className="relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="rounded-full border-[5px] border-black shadow-[0_0_80px_rgba(255,255,255,0.2)]"
              />

              <div className="absolute top-[-24px] left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400 drop-shadow-xl" />
              </div>

              <button
                onClick={spinWheel}
                disabled={spinning}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full
            bg-gradient-to-br from-red-600 to-yellow-400 text-white font-bold text-lg border-4 border-white shadow-xl
            hover:scale-105 transition-all duration-300 disabled:opacity-60"
              >
                  SPIN
              </button>
          </div>

          {result && (
            <div className="text-center animate-fadeIn mt-6">
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">You won:</h2>
                <p className="text-4xl font-extrabold text-white">{result}$</p>
            </div>
          )}
      </div>
    )
}
