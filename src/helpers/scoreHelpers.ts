import type { Player, Round } from "../types/game.types"

/** Total points for a single player across all rounds. */
export const playerTotal = (playerId: string, rounds: Round[]): number =>
  rounds.reduce((sum, r) => sum + (r.scores[playerId] ?? 0), 0)

/** Map of playerId → total points. */
export const allTotals = (
  players: Player[],
  rounds: Round[],
): Record<string, number> =>
  Object.fromEntries(players.map((p) => [p.id, playerTotal(p.id, rounds)]))

export interface RankedPlayer {
  player: Player
  total: number
  rank: number
}

/** Players ranked best→worst (lower total = better). Ties share a rank. */
export const rankPlayers = (
  players: Player[],
  rounds: Round[],
): RankedPlayer[] => {
  const totals = allTotals(players, rounds)
  const sorted = [...players].sort((a, b) => totals[a.id] - totals[b.id])

  let lastTotal: number | null = null
  let lastRank = 0
  return sorted.map((player, i) => {
    const total = totals[player.id]
    const rank = total === lastTotal ? lastRank : i + 1
    lastTotal = total
    lastRank = rank
    return { player, total, rank }
  })
}

export interface Standing {
  rank: number
  /** positions moved vs. before the latest round; +gained, -lost, 0 unchanged */
  delta: number
}

/**
 * Current rank per player plus how many positions they moved compared to the
 * standings before the most recent round was submitted.
 */
export const standings = (
  players: Player[],
  rounds: Round[],
): Record<string, Standing> => {
  const currentRanks = rankPlayers(players, rounds)
  const prevRanks = rankPlayers(players, rounds.slice(0, -1))
  const prevRankById = Object.fromEntries(
    prevRanks.map((r) => [r.player.id, r.rank]),
  )
  return Object.fromEntries(
    currentRanks.map((r) => {
      const prev = prevRankById[r.player.id] ?? r.rank
      return [r.player.id, { rank: r.rank, delta: prev - r.rank }]
    }),
  )
}

/** The winning player (lowest total). Undefined if no players. */
export const winner = (
  players: Player[],
  rounds: Round[],
): Player | undefined => rankPlayers(players, rounds)[0]?.player

/** Cumulative totals per round for charting. */
export const cumulativeSeries = (
  players: Player[],
  rounds: Round[],
): Array<Record<string, number>> => {
  const running: Record<string, number> = Object.fromEntries(
    players.map((p) => [p.id, 0]),
  )
  return rounds.map((r) => {
    players.forEach((p) => {
      running[p.id] += r.scores[p.id] ?? 0
    })
    return { round: r.index, ...running }
  })
}
