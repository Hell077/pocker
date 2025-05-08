import { useCallback, useEffect, useRef, useState } from 'react'
import { authFetch } from '@/utils/authFetch'
import { useToast } from '@/hooks/useToast'
import { formatSecondsToTime } from '@/utils/time'
import { API_URL } from '@/env/api';
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en


interface RewardItem {
    Reward: number
}

const COLORS = [
    '#ffd700', '#c0c0c0', '#cd7f32', '#e0115f', '#4169e1', '#3cb371', '#ff4500', '#8a2be2',
    '#00ced1', '#fa8072', '#ff8c00', '#7fffd4', '#ff1493', '#20b2aa', '#ff6347', '#dda0dd',
    '#add8e6', '#90ee90', '#ff69b4', '#1e90ff'
]

export default function FortuneWheel() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [segments, setSegments] = useState<string[]>([])
    const [angle, setAngle] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const { success, error, warning } = useToast()
    const SEGMENT_ANGLE = 360 / segments.length

    useEffect(() => {
        let frameId: number

        const idleSpin = () => {
            setAngle(prev => prev + 0.05)
            frameId = requestAnimationFrame(idleSpin)
        }

        if (!spinning) {
            frameId = requestAnimationFrame(idleSpin)
        }

        return () => {
            cancelAnimationFrame(frameId)
        }
    }, [spinning])

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
              if (!Array.isArray(data.Items)) throw new Error(lang.wheel.invalid_data_format)
              setSegments(data.Items.map((item: RewardItem) => `${item.Reward}`))
          })
          .catch(err => {
              error(lang.wheel.load_rewards_error(err))
          })
    }, [])

    useEffect(() => {
        loadWheelData()
    }, [loadWheelData])

    useEffect(() => {
        drawWheel()
    }, [drawWheel])

    const spinWheel = async () => {
        if (spinning || segments.length === 0) return

        try {
            const res = await authFetch(`${API_URL}/daily-reward/cooldown`)
            const data = await res.json()

            if (data.cooldown_seconds > 0) {
                const formatted = formatSecondsToTime(data.cooldown_seconds)
                warning(lang.wheel.next_spin_in(formatted))
                return
            }
        } catch (err) {
            error(lang.wheel.spin_check_error(err))
            return
        }

        setSpinning(true)
        setResult(null)

        let amount = '0'
        try {
            const res = await authFetch(`${API_URL}/daily-reward`, { method: 'POST' })
            const data = await res.json()
            amount = `${data.reward.Amount}`
        } catch (err) {
            error(lang.wheel.reward_fetch_error(err))
            setSpinning(false)
            return
        }

        const index = segments.indexOf(amount)
        if (index === -1) {
            error(lang.wheel.reward_not_found(amount))
            setSpinning(false)
            return
        }

        const segmentAngle = 360 / segments.length
        const targetAngle = 270 - (index * segmentAngle + segmentAngle / 2)
        const fullSpins = 6
        const totalRotation = fullSpins * 360 + targetAngle
        const duration = 5000
        const start = performance.now()

        const animate = async (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 5)
            const current = ease * totalRotation

            setAngle(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setAngle(totalRotation)
                setResult(amount)
                setSpinning(false)
                success(`${lang.wheel.you_won} ${amount}!`)

                try {
                    const res = await authFetch(`${API_URL}/auth/me`)
                    const data = await res.json()
                    localStorage.setItem('user', JSON.stringify(data))
                    window.dispatchEvent(new Event('auth-updated'))
                } catch (err) {
                    console.error('Ошибка при обновлении данных пользователя:', err)
                }
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
                  {lang.wheel.spin}
              </button>
          </div>

          {result && (
            <div className="text-center animate-fadeIn mt-6">
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">{lang.wheel.you_won}</h2>
                <p className="text-4xl font-extrabold text-white">{result}$</p>
            </div>
          )}
      </div>
    )
}
