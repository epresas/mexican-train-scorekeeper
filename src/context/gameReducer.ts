import type { GameAction, GameState, Player, Round, GameRules } from "../types/game.types"

const defaultGameRules: GameRules = {
  mode: "standard",
  arrivalBonus: false,
  penaltiesEnabled: false,
  penaltyMultiplier: 3,
}

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
  gameRules: defaultGameRules,
  currentRoundPenalties: {},
}

/** Rank playerIds best→worst by the given round scores. Lower is better in standard mode, higher is better in arrivalsOnly mode. */
const rankRound = (scores: Record<string, number>, isArrivalsOnly = false): string[] =>
  Object.keys(scores).sort((a, b) =>
    isArrivalsOnly ? scores[b] - scores[a] : scores[a] - scores[b],
  )

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "GO_SETUP":
      return { ...initialGameState, phase: "setup" }

    case "SET_GAME_RULES":
      return {
        ...state,
        gameRules: action.payload,
      }

    case "RESTORE_GAME":
      return action.payload

    case "ADD_PENALTY": {
      const { playerId, amount = 1 } = action.payload
      return {
        ...state,
        currentRoundPenalties: {
          ...state.currentRoundPenalties,
          [playerId]: (state.currentRoundPenalties[playerId] ?? 0) + amount,
        },
      }
    }

    case "START_GAME": {
      const players: Player[] = action.payload.players.map((p) => ({
        id: p.id,
        name: p.name,
        arrivals: 0,
        roundsAsLast: 0,
        penaltyCount: 0,
        arrivalBonusTotal: 0,
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
        gameRules: state.gameRules, // preserve rules configured during setup
        currentRoundPenalties: {},
      }
    }

    case "END_ROUND":
      return {
        ...state,
        isInputPhase: true,
        pendingScores: Object.fromEntries(
          state.players.map((p) => [p.id, null]),
        ),
        // NOTE: do NOT reset currentRoundPenalties here — penalties are added
        // via ADD_PENALTY during the input phase (after END_ROUND), so they
        // must survive until SUBMIT_ROUND consumes and clears them.
      }

    case "SUBMIT_ROUND": {
      const { scores, arrivals, duration } = action.payload
      const isArrivalsOnly = state.gameRules.mode === "arrivalsOnly"

      const finalScores: Record<string, number> = {}
      for (const p of state.players) {
        if (isArrivalsOnly) {
          finalScores[p.id] = arrivals[p.id] ? 1 : 0
        } else {
          const enteredScore = scores[p.id] ?? 0
          const pCount = state.currentRoundPenalties[p.id] ?? 0
          const penaltyMult = state.gameRules.penaltiesEnabled ? state.gameRules.penaltyMultiplier : 0
          const penaltyPoints = pCount * penaltyMult

          if (arrivals[p.id]) {
            const baseArrivalScore = state.gameRules.arrivalBonus ? -10 : 0
            finalScores[p.id] = baseArrivalScore + penaltyPoints
          } else {
            finalScores[p.id] = enteredScore + penaltyPoints
          }
        }
      }

      const rankings = rankRound(finalScores, isArrivalsOnly)

      // highest score in the round = "last" this round (ties share the flag)
      const maxScore = Math.max(...Object.values(finalScores))

      const players = state.players.map((p) => {
        const addedArrival = arrivals[p.id] ? 1 : 0
        const newArrivals = p.arrivals + addedArrival
        const arrivalBonusTotal = state.gameRules.arrivalBonus ? newArrivals * 10 : 0
        const addedPenalty = state.gameRules.penaltiesEnabled ? (state.currentRoundPenalties[p.id] ?? 0) : 0

        return {
          ...p,
          arrivals: newArrivals,
          arrivalBonusTotal,
          penaltyCount: p.penaltyCount + addedPenalty,
          roundsAsLast:
            p.roundsAsLast + (finalScores[p.id] === maxScore && maxScore > 0 ? 1 : 0),
        }
      })

      const round: Round = {
        index: state.currentRound,
        scores: finalScores,
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
        currentRoundPenalties: {},
        roundStartTime: isLastRound ? state.roundStartTime : Date.now(),
      }
    }

    case "EXIT_GAME":
      return { ...initialGameState, phase: "dashboard" }

    default:
      return state
  }
}

