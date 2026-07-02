import type { Player, Round } from "../types/game.types"

/** Player with the most arrivals (going out). Undefined on tie-at-zero/empty. */
export const mostArrivals = (players: Player[]): Player | undefined => {
  const best = [...players].sort((a, b) => b.arrivals - a.arrivals)[0]
  return best && best.arrivals > 0 ? best : undefined
}

/** Player who was "last" (highest round score) most often. */
export const mostRoundsAsLast = (players: Player[]): Player | undefined => {
  const best = [...players].sort((a, b) => b.roundsAsLast - a.roundsAsLast)[0]
  return best && best.roundsAsLast > 0 ? best : undefined
}

/** Total time played, in seconds. */
export const totalTime = (rounds: Round[]): number =>
  rounds.reduce((sum, r) => sum + r.duration, 0)

/** The longest round duration in seconds (0 if no rounds). */
export const longestRound = (rounds: Round[]): number =>
  rounds.reduce((max, r) => Math.max(max, r.duration), 0)
