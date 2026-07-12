import { useMemo, useState } from "react"
import { useGameContext } from "../../context/GameContext"
import { useTranslation } from "../../i18n/useTranslation"
import { rankPlayers } from "../../helpers/scoreHelpers"
import { playerColor } from "../../helpers/constants"

const MEDALS = ["🥇", "🥈", "🥉"]

export const useGameResults = () => {
  const { state, dispatch } = useGameContext()
  const { t } = useTranslation()
  const [statsOpen, setStatsOpen] = useState(false)

  // color map keyed by player id (stable order from setup)
  const colorById = useMemo(
    () =>
      Object.fromEntries(state.players.map((p, i) => [p.id, playerColor(i)])),
    [state.players],
  )

  const ranked = useMemo(
    () =>
      rankPlayers(state.players, state.rounds).map((r) => ({
        ...r,
        color: colorById[r.player.id],
        medal: r.rank <= 3 ? MEDALS[r.rank - 1] : null,
      })),
    [state.players, state.rounds, colorById],
  )

  const openStats = () => setStatsOpen(true)
  const closeStats = () => setStatsOpen(false)
  const newGame = () => dispatch({ type: "EXIT_GAME" })

  return {
    t,
    ranked,
    players: state.players,
    rounds: state.rounds,
    colorById,
    statsOpen,
    gameRules: state.gameRules,
    openStats,
    closeStats,
    newGame,
  }
}
