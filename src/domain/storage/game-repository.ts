import { createStorageAdapter } from "./storage-adapter"
import { GameState, isValidGameState } from "@/domain/types/game.types"

export const storageAdapter = createStorageAdapter()

const STATE_KEY = "mexican_train_scorekeeper_state"

export const gameRepository = {
  async save(state: GameState): Promise<void> {
    try {
      await storageAdapter.save(STATE_KEY, JSON.stringify(state))
    } catch (e) {
      // Fail silently, error is caught inside the adapter
    }
  },

  async load(): Promise<GameState | null> {
    try {
      const data = await storageAdapter.load(STATE_KEY)
      if (!data) return null
      const parsed: unknown = JSON.parse(data)
      return isValidGameState(parsed) ? parsed : null
    } catch (e) {
      return null
    }
  },

  async clear(): Promise<void> {
    try {
      await storageAdapter.remove(STATE_KEY)
    } catch (e) {
      // Fail silently
    }
  },
}
