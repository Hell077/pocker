import { useEffect, useRef, useState } from 'react'
import { useGameContext } from './GameStateContext'

export default function ActionPanel() {
    const [showModal, setShowModal] = useState(false)
    const [raiseAmount, setRaiseAmount] = useState(0)
    const minRaise = 50
    const maxRaise = 2000
    const step = 50

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const userId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userId='))
        ?.split('=')[1] || ''

    const { gameState,
        sendPlayerAction,
        availableActions,
        fetchAvailableActions
    } = useGameContext()

    const isYourTurn = gameState.currentTurn === userId

    useEffect(() => {
        if (isYourTurn) {
            void fetchAvailableActions()
        }
    }, [isYourTurn, fetchAvailableActions])

    const startInterval = (direction: 'up' | 'down') => {
        if (intervalRef.current) return
        intervalRef.current = setInterval(() => {
            setRaiseAmount((prev) =>
                direction === 'up'
                    ? Math.min(maxRaise, prev + step)
                    : Math.max(minRaise, prev - step)
            )
        }, 100)
    }

    const stopInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const handleRaiseClick = () => {
        setRaiseAmount(minRaise)
        setShowModal(true)
    }

    const handleConfirm = () => {
        sendPlayerAction('raise', { amount: raiseAmount })
        setShowModal(false)
    }

    return (
        <>
            {/* Визуал чей ход */}
            <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-40">
                {isYourTurn ? (
                    <span className="text-green-400 font-bold text-xl">Ваш ход!</span>
                ) : (
                    <span className="text-gray-400 font-medium text-sm">
            Ожидание других игроков...
          </span>
                )}
            </div>

            {/* Кнопки действий */}
            {isYourTurn && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-4">
                    {availableActions.includes('fold') && (
                        <button
                            onClick={() => sendPlayerAction('fold')}
                            className="px-6 py-2 rounded-full bg-red-700 hover:bg-red-600 text-white font-semibold shadow-md"
                        >
                            Fold
                        </button>
                    )}
                    {availableActions.includes('call') && (
                        <button
                            onClick={() => sendPlayerAction('call')}
                            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                        >
                            Call
                        </button>
                    )}
                    {availableActions.includes('raise') && (
                        <button
                            onClick={handleRaiseClick}
                            className="px-6 py-2 rounded-full bg-green-700 hover:bg-green-600 text-white font-semibold shadow-md"
                        >
                            Raise
                        </button>
                    )}
                </div>
            )}

            {/* Raise Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#111] border border-yellow-400 rounded-xl shadow-[0_0_30px_#facc15] p-6 w-[340px] animate-fadeIn text-center">
                        <h2 className="text-xl text-white mb-4 font-bold">Enter Raise Amount</h2>

                        <div className="flex items-center justify-between gap-2 bg-black border border-yellow-500 rounded px-2 py-1 mb-4">
                            <button
                                onMouseDown={() => startInterval('down')}
                                onMouseUp={stopInterval}
                                onMouseLeave={stopInterval}
                                onClick={() =>
                                    setRaiseAmount((prev) => Math.max(minRaise, prev - step))
                                }
                                className="text-yellow-400 text-xl font-bold px-2 hover:text-yellow-300"
                            >
                                −
                            </button>

                            <input
                                type="text"
                                value={raiseAmount}
                                onChange={(e) => {
                                    const val = Number(e.target.value)
                                    if (!isNaN(val)) setRaiseAmount(val)
                                }}
                                className="bg-black text-white text-center w-full outline-none"
                            />

                            <button
                                onMouseDown={() => startInterval('up')}
                                onMouseUp={stopInterval}
                                onMouseLeave={stopInterval}
                                onClick={() =>
                                    setRaiseAmount((prev) => Math.min(maxRaise, prev + step))
                                }
                                className="text-yellow-400 text-xl font-bold px-2 hover:text-yellow-300"
                            >
                                +
                            </button>
                        </div>

                        <p className="text-sm text-yellow-300 mb-4">
                            Min: ${minRaise} • Max: ${maxRaise}
                        </p>

                        <div className="flex justify-between gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={raiseAmount < minRaise || raiseAmount > maxRaise}
                                className="flex-1 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
