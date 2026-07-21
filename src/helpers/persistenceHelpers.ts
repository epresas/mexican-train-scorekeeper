import { createStorageAdapter } from "./storageAdapter"
import type { GameState } from "../types/game.types"

export const storageAdapter = createStorageAdapter()

const STATE_KEY = "mexican_train_scorekeeper_state"

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await storageAdapter.save(STATE_KEY, JSON.stringify(state))
  } catch (e) {
    // Fail silently, error is caught inside the adapter
  }
}

export async function loadGameState(): Promise<GameState | null> {
  try {
    const data = await storageAdapter.load(STATE_KEY)
    if (!data) return null
    return JSON.parse(data) as GameState
  } catch (e) {
    return null
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await storageAdapter.remove(STATE_KEY)
  } catch (e) {
    // Fail silently
  }
}
