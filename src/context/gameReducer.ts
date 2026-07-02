import type { GameAction, GameState, Player, Round } from "../types/game.types"

export const initialGameState: GameState = {
  phase: "dashboard",
  players: [],
  totalRounds: 0,
  currentRound: 0,
  rounds: [],
  gameStartTime: null,
  roundStartTime: null,
  isInputPhase: false,
  pendingScores: {},
}

/** Rank playerIds best→worst by the given round scores (lower = better). */
const rankRound = (scores: Record<string, number>): string[] =>
  Object.keys(scores).sort((a, b) => scores[a] - scores[b])

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "GO_SETUP":
      return { ...initialGameState, phase: "setup" }

    case "START_GAME": {
      const players: Player[] = action.payload.players.map((p) => ({
        id: p.id,
        name: p.name,
        arrivals: 0,
        roundsAsLast: 0,
      }))
      const now = Date.now()
      return {
        ...initialGameState,
        phase: "playing",
        players,
        totalRounds: action.payload.totalRounds,
        currentRound: 1,
        rounds: [],
        gameStartTime: now,
        roundStartTime: now,
        isInputPhase: false,
        pendingScores: {},
      }
    }

    case "END_ROUND":
      return {
        ...state,
        isInputPhase: true,
        pendingScores: Object.fromEntries(
          state.players.map((p) => [p.id, null]),
        ),
      }

    case "SUBMIT_ROUND": {
      const { scores, arrivals, duration } = action.payload
      const rankings = rankRound(scores)

      // highest score in the round = "last" this round (ties share the flag)
      const maxScore = Math.max(...Object.values(scores))

      const players = state.players.map((p) => ({
        ...p,
        arrivals: p.arrivals + (arrivals[p.id] ? 1 : 0),
        roundsAsLast:
          p.roundsAsLast + (scores[p.id] === maxScore && maxScore > 0 ? 1 : 0),
      }))

      const round: Round = {
        index: state.currentRound,
        scores,
        duration,
        rankings,
      }

      const isLastRound = state.currentRound >= state.totalRounds

      return {
        ...state,
        players,
        rounds: [...state.rounds, round],
        currentRound: isLastRound
          ? state.currentRound
          : state.currentRound + 1,
        phase: isLastRound ? "results" : "playing",
        isInputPhase: false,
        pendingScores: {},
        roundStartTime: isLastRound ? state.roundStartTime : Date.now(),
      }
    }

    case "EXIT_GAME":
      return { ...initialGameState, phase: "dashboard" }

    default:
      return state
  }
}
