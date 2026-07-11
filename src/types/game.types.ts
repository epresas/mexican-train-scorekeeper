export type GamePhase = "dashboard" | "setup" | "playing" | "results"

export interface Player {
  id: string
  name: string
  /** times they went out (finished their tiles) */
  arrivals: number
  /** times they had the highest score in a round */
  roundsAsLast: number
  /** cumulative number of penalty units applied across the whole game */
  penaltyCount: number
  /** cumulative arrival bonus (arrivals * 10) accrued across the game */
  arrivalBonusTotal: number
}

export interface GameRules {
  /** subtract 10 points from a player each time they arrive */
  arrivalBonus: boolean
  /** enable per-round penalty tracking */
  penaltiesEnabled: boolean
  /** points multiplier applied to each pending penalty on submit */
  penaltyMultiplier: 3 | 5
}

export const DEFAULT_GAME_RULES: GameRules = {
  arrivalBonus: false,
  penaltiesEnabled: false,
  penaltyMultiplier: 3,
}

export interface Round {
  index: number
  /** playerId → points */
  scores: Record<string, number>
  /** seconds */
  duration: number
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
  /** pending penalty units for the round in progress, keyed by playerId */
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
      payload: { players: SetupPlayerInput[]; totalRounds: number }
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
