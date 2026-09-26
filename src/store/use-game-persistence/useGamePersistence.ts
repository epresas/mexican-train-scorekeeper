import { useEffect, useState, useCallback, Dispatch } from "react"
import { GameAction, GameState } from "@/domain/types/game.types"
import { gameRepository, storageAdapter } from "@/domain/storage/game-repository"

export const useGamePersistence = (state: GameState, dispatch: Dispatch<GameAction>) => {
  const [showRestoredBanner, setShowRestoredBanner] = useState(false)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  // Listen to adapter failure
  useEffect(() => {
    if (!storageAdapter.isAvailable) {
      Promise.resolve().then(() => setShowWarningBanner(true))
    }
    storageAdapter.onStorageFailed = () => {
      setShowWarningBanner(true)
    }
  }, [])

  // Load game state on mount
  useEffect(() => {
    const init = async () => {
      const saved = await gameRepository.load()
      if (saved && saved.phase === "playing") {
        dispatch({ type: "RESTORE_GAME", payload: saved })
        setShowRestoredBanner(true)
      }
    }
    init()
  }, [dispatch])

  // Auto-hide restored banner after 3 seconds
  useEffect(() => {
    if (showRestoredBanner) {
      const timer = setTimeout(() => setShowRestoredBanner(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showRestoredBanner])

  // Debounced save state
  useEffect(() => {
    if (state.phase === "dashboard") {
      return
    }
    const timer = setTimeout(() => {
      gameRepository.save(state)
    }, 300)
    return () => clearTimeout(timer)
  }, [state])

  return {
    showRestoredBanner,
    setShowRestoredBanner,
    showWarningBanner,
    setShowWarningBanner,
  }
}
