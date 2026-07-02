export type GamePhase = "dashboard" | "setup" | "playing" | "results"

export interface Player {
  id: string
  name: string
  /** times they went out (finished their tiles) */
  arrivals: number
  /** times they had the highest score in a round */
  roundsAsLast: number
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
