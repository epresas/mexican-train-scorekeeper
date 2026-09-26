import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  type Dispatch,
  type ReactNode,
} from "react"
import { gameReducer, initialGameState } from "@/domain/game-reducer"
import type { GameAction, GameState } from "@/domain/types/game.types"
import { gameRepository } from "@/domain/storage/game-repository"

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  // Custom dispatch to clear state immediately on EXIT_GAME
  const customDispatch = useCallback(
    (action: GameAction) => {
      if (action.type === "EXIT_GAME") {
        gameRepository.clear()
      }
      dispatch(action)
    },
    [dispatch],
  )

  const value = useMemo(
    () => ({
      state,
      dispatch: customDispatch,
    }),
    [state, customDispatch],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = () => {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return ctx
}

