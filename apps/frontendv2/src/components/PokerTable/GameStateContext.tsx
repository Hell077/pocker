import { createContext, useContext } from 'react'
import { useGameState } from './useGameState'

const GameStateContext = createContext<ReturnType<typeof useGameState> | null>(null)

export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useGameState()

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  )
}

export const useGameContext = () => {
  const context = useContext(GameStateContext)
  if (!context) throw new Error('useGameContext must be used within GameStateProvider')
  return context
}
