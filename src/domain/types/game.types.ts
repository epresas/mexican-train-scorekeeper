export type GamePhase = "dashboard" | "setup" | "playing" | "results"

export type GameMode = "standard" | "arrivalsOnly"

export interface GameRules {
  mode: GameMode
  arrivalBonus: boolean
  penaltiesEnabled: boolean
  penaltyMultiplier: 3 | 5
}

export interface Player {
  id: string
  name: string
  /** times they went out (finished their tiles) */
  arrivals: number
  /** times they had the highest score in a round */
  roundsAsLast: number
  penaltyCount: number        // cumulative across the game
  arrivalBonusTotal: number   // cumulative: arrivals * 10
}

export interface Round {
  index: number
  /** playerId → points */
  scores: Record<string, number>
  /** seconds */
  duration: number
  /** playerId -> true if they arrived this round */
  arrivals?: Record<string, boolean>
  /** playerIds sorted best→worst */
  rankings: string[]
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  totalRounds: number
  currentRound: number
  rounds: Round[]
  gameStartTime: number | null
  roundStartTime: number | null
  isInputPhase: boolean
  pendingScores: Record<string, number | null>
  gameRules: GameRules
  currentRoundPenalties: Record<string, number>
}

export interface SetupPlayerInput {
  id: string
  name: string
}

export type GameAction =
  | { type: "GO_SETUP" }
  | {
      type: "START_GAME"
      payload: { players: SetupPlayerInput[]; totalRounds: number; gameRules: GameRules }
    }
  | { type: "END_ROUND" }
  | {
      type: "SUBMIT_ROUND"
      payload: {
        scores: Record<string, number>
        arrivals: Record<string, boolean>
        duration: number
      }
    }
  | { type: "EXIT_GAME" }
  | { type: "ADD_PENALTY"; payload: { playerId: string; amount?: number } }
  | { type: "RESTORE_GAME"; payload: GameState }
  | { type: "EDIT_ROUND_SCORE"; payload: { roundIndex: number; playerId: string; newScore: number } }

export function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return (
    typeof d.phase === "string" &&
    ["dashboard", "setup", "playing", "results"].includes(d.phase as string) &&
    Array.isArray(d.players) &&
    typeof d.currentRound === "number"
  )
}

