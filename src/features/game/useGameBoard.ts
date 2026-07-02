import { useMemo, useState } from "react"
import { useGameContext } from "../../context/GameContext"
import { useTranslation } from "../../i18n/useTranslation"
import { useTimer, formatDuration } from "../../hooks/useTimer"
import { allTotals } from "../../helpers/scoreHelpers"
import { playerColor } from "../../helpers/constants"

interface ScoreEntry {
  value: string
  arrived: boolean
}

const emptyEntry = (): ScoreEntry => ({ value: "", arrived: false })

export const useGameBoard = () => {
  const { state, dispatch } = useGameContext()
  const { t } = useTranslation()

  const { elapsed } = useTimer({
    startTime: state.roundStartTime,
    running: state.phase === "playing",
  })

  const [entries, setEntries] = useState<Record<string, ScoreEntry>>({})
  const [error, setError] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)

  const totals = useMemo(
    () => allTotals(state.players, state.rounds),
    [state.players, state.rounds],
  )

  const players = useMemo(
    () =>
      state.players.map((p, i) => ({
        ...p,
        color: playerColor(i),
        total: totals[p.id] ?? 0,
        entry: entries[p.id] ?? emptyEntry(),
      })),
    [state.players, totals, entries],
  )

  const endRound = () => {
    setEntries(
      Object.fromEntries(state.players.map((p) => [p.id, emptyEntry()])),
    )
    setError(null)
    dispatch({ type: "END_ROUND" })
  }

  const setScore = (playerId: string, value: string) => {
    // allow only digits
    const clean = value.replace(/[^\d]/g, "")
    setEntries((prev) => ({
      ...prev,
      [playerId]: { ...(prev[playerId] ?? emptyEntry()), value: clean },
    }))
    setError(null)
  }

  const toggleArrived = (playerId: string) => {
    setEntries((prev) => {
      const current = prev[playerId] ?? emptyEntry()
      const arrived = !current.arrived
      return {
        ...prev,
        [playerId]: {
          arrived,
          value: arrived ? "0" : "",
        },
      }
    })
    setError(null)
  }

  const submitRound = () => {
    const scores: Record<string, number> = {}
    const arrivals: Record<string, boolean> = {}

    for (const p of state.players) {
      const entry = entries[p.id] ?? emptyEntry()
      if (entry.value === "" || Number.isNaN(Number(entry.value))) {
        setError(t("game.errorScores"))
        return
      }
      scores[p.id] = Number(entry.value)
      arrivals[p.id] = entry.arrived
    }

    dispatch({
      type: "SUBMIT_ROUND",
      payload: { scores, arrivals, duration: elapsed },
    })
    setEntries({})
  }

  const requestExit = () => setExitOpen(true)
  const cancelExit = () => setExitOpen(false)
  const confirmExit = () => {
    setExitOpen(false)
    dispatch({ type: "EXIT_GAME" })
  }

  return {
    t,
    players,
    rounds: state.rounds,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    isInputPhase: state.isInputPhase,
    timerLabel: formatDuration(elapsed),
    error,
    exitOpen,
    endRound,
    setScore,
    toggleArrived,
    submitRound,
    requestExit,
    cancelExit,
    confirmExit,
  }
}
