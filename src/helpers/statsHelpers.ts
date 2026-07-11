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

export interface HighestSingleRound {
  player: Player
  score: number
  round: number
}

/**
 * The single highest score any player took in any one round.
 * Undefined when there are no rounds or every score is zero.
 */
export const getHighestSingleRoundScore = (
  rounds: Round[],
  players: Player[],
): HighestSingleRound | undefined => {
  let best: HighestSingleRound | undefined
  for (const r of rounds) {
    for (const p of players) {
      const score = r.scores[p.id] ?? 0
      if (!best || score > best.score) {
        best = { player: p, score, round: r.index }
      }
    }
  }
  return best && best.score > 0 ? best : undefined
}
