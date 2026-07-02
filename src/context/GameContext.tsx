import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react"
import { gameReducer, initialGameState } from "./gameReducer"
import type { GameAction, GameState } from "../types/game.types"

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGameContext = () => {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return ctx
}
