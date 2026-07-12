import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type ReactNode,
} from "react"
import { gameReducer, initialGameState } from "./gameReducer"
import type { GameAction, GameState } from "../types/game.types"
import {
  loadGameState,
  saveGameState,
  clearGameState,
  storageAdapter,
} from "../helpers/persistenceHelpers"

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  showRestoredBanner: boolean
  setShowRestoredBanner: (show: boolean) => void
  showWarningBanner: boolean
  setShowWarningBanner: (show: boolean) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const [showRestoredBanner, setShowRestoredBanner] = useState(false)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  // Listen to adapter failure
  useEffect(() => {
    if (!storageAdapter.isAvailable) {
      setShowWarningBanner(true)
    }
    storageAdapter.onStorageFailed = () => {
      setShowWarningBanner(true)
    }
  }, [])

  // Load game state on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadGameState()
      if (saved && saved.phase === "playing") {
        dispatch({ type: "RESTORE_GAME", payload: saved })
        setShowRestoredBanner(true)
      }
    }
    init()
  }, [])

  // Debounced save state
  useEffect(() => {
    if (state.phase === "dashboard") {
      return
    }
    const timer = setTimeout(() => {
      saveGameState(state)
    }, 300)
    return () => clearTimeout(timer)
  }, [state])

  // Custom dispatch to clear state immediately on EXIT_GAME
  const customDispatch = useCallback(
    (action: GameAction) => {
      if (action.type === "EXIT_GAME") {
        clearGameState()
      }
      dispatch(action)
    },
    [dispatch],
  )

  const value = useMemo(
    () => ({
      state,
      dispatch: customDispatch,
      showRestoredBanner,
      setShowRestoredBanner,
      showWarningBanner,
      setShowWarningBanner,
    }),
    [state, customDispatch, showRestoredBanner, showWarningBanner],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGameContext = () => {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return ctx
}

