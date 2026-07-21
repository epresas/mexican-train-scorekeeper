import type { GameMode, Player, Round } from "../types/game.types"

/** Total points for a single player across all rounds. */
export const playerTotal = (playerId: string, rounds: Round[]): number =>
  rounds.reduce((sum, r) => sum + (r.scores[playerId] ?? 0), 0)

/** Map of playerId → total points. */
export const allTotals = (
  players: Player[],
  rounds: Round[],
): Record<string, number> =>
  Object.fromEntries(
    players.map((p) => [p.id, playerTotal(p.id, rounds)]),
  )

export interface RankedPlayer {
  player: Player
  total: number
  rank: number
}

/** Players ranked best→worst. In standard mode lower total is better; in arrivalsOnly mode higher total is better. Ties share a rank. */
export const rankPlayers = (
  players: Player[],
  rounds: Round[],
  mode: GameMode = "standard",
): RankedPlayer[] => {
  const totals = allTotals(players, rounds)
  const isArrivalsOnly = mode === "arrivalsOnly"
  const sorted = [...players].sort((a, b) => {
    if (totals[a.id] !== totals[b.id]) {
      return isArrivalsOnly ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id]
    }
    // Tie-breaker: player with more arrivals wins
    return b.arrivals - a.arrivals
  })

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
  mode: GameMode = "standard",
): Record<string, Standing> => {
  const currentRanks = rankPlayers(players, rounds, mode)
  const prevRanks = rankPlayers(players, rounds.slice(0, -1), mode)
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

/** The winning player (best score according to mode). Undefined if no players. */
export const winner = (
  players: Player[],
  rounds: Round[],
  mode: GameMode = "standard",
): Player | undefined => rankPlayers(players, rounds, mode)[0]?.player

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
