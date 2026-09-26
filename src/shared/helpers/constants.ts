export const PLAYER_COLORS = [
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
]

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const MIN_ROUNDS = 1
export const MAX_ROUNDS = 20
export const DEFAULT_ROUNDS = 6

export const playerColor = (index: number) =>
  PLAYER_COLORS[index % PLAYER_COLORS.length]
