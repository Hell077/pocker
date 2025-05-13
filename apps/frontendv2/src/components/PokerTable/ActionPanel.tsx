import { useEffect, useRef, useState } from 'react'
import { useGameContext } from './GameStateContext'

export default function ActionPanel() {
    const [showModal, setShowModal] = useState(false)
    const [raiseAmount, setRaiseAmount] = useState(0)
    const [selectedAction, setSelectedAction] = useState<string | null>(null)

    const minRaise = 50
    const maxRaise = 2000
    const step = 50

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const getUserId = (): string => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            return user.id || ''
        } catch {
            return ''
        }
    }

    const {
        gameState,
        sendPlayerAction,
        availableActions,
        fetchAvailableActions,
    } = useGameContext()

    const isYourTurn = gameState.currentTurn === getUserId()

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

    const handleActionClick = (action: string) => {
        if (['bet', 'raise'].includes(action)) {
            setRaiseAmount(minRaise)
            setSelectedAction(action)
            setShowModal(true)
        } else {
            sendPlayerAction(action)
        }
    }

    const handleConfirm = () => {
        if (!selectedAction) return
        sendPlayerAction(selectedAction, { amount: raiseAmount })
        setShowModal(false)
    }

    return (
      <>
          {isYourTurn && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#111] border border-pink-500 rounded-lg p-4 shadow-2xl flex flex-wrap gap-3 justify-center">
                {Array.isArray(availableActions) && availableActions.length > 0 ? (
                  availableActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleActionClick(action)}
                      className="px-6 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold uppercase shadow-md"
                    >
                        {action}
                    </button>
                  ))
                ) : (
                  <span className="text-gray-400">Нет доступных действий</span>
                )}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
                <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1f1f1f] border border-yellow-400 rounded-2xl shadow-[0_0_40px_#facc15] px-6 py-8 w-[360px] text-center">
                    <h2 className="text-2xl text-yellow-400 mb-4 font-extrabold tracking-wide">
                        {selectedAction?.toUpperCase()} Ставка
                    </h2>

                    <div className="flex items-center justify-between bg-black/70 border border-yellow-500 rounded-full px-3 py-2 mb-5">
                        <button
                          onMouseDown={() => startInterval('down')}
                          onMouseUp={stopInterval}
                          onMouseLeave={stopInterval}
                          onClick={() =>
                            setRaiseAmount((prev) => Math.max(minRaise, prev - step))
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-2xl"
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
                          className="bg-transparent text-white text-xl text-center w-24 outline-none font-mono"
                        />

                        <button
                          onMouseDown={() => startInterval('up')}
                          onMouseUp={stopInterval}
                          onMouseLeave={stopInterval}
                          onClick={() =>
                            setRaiseAmount((prev) => Math.min(maxRaise, prev + step))
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-2xl"
                        >
                            +
                        </button>
                    </div>

                    <p className="text-sm text-yellow-300 mb-6">
                        Мин: ${minRaise} • Макс: ${maxRaise}
                    </p>

                    <div className="flex justify-between gap-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="flex-1 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
                        >
                            Отмена
                        </button>
                        <button
                          onClick={handleConfirm}
                          disabled={raiseAmount < minRaise || raiseAmount > maxRaise}
                          className="flex-1 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold disabled:opacity-40"
                        >
                            Подтвердить
                        </button>
                    </div>
                </div>
            </div>
          )}
      </>
    )
}
