import { useMemo, useState } from "react"
import { useGameContext } from "../../context/GameContext"
import { useTranslation } from "../../i18n/useTranslation"
import {
  DEFAULT_ROUNDS,
  MAX_PLAYERS,
  MAX_ROUNDS,
  MIN_PLAYERS,
  MIN_ROUNDS,
  playerColor,
} from "../../helpers/constants"
import type { SetupPlayerInput } from "../../types/game.types"

const makeId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const useGameSetup = () => {
  const { dispatch } = useGameContext()
  const { t } = useTranslation()

  const [playerCount, setPlayerCount] = useState(2)
  const [totalRounds, setTotalRounds] = useState(DEFAULT_ROUNDS)
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, () => ""),
  )
  const [error, setError] = useState<string | null>(null)

  // Additional rules state
  const [arrivalBonus, setArrivalBonus] = useState(false)
  const [penaltiesEnabled, setPenaltiesEnabled] = useState(false)
  const [penaltyMultiplier, setPenaltyMultiplier] = useState<3 | 5>(3)

  const changeCount = (count: number) => {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count))
    setPlayerCount(clamped)
    setError(null)
  }

  const changeName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setError(null)
  }

  const changeRounds = (rounds: number) => {
    const clamped = Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, rounds))
    setTotalRounds(clamped)
  }

  const players = useMemo(
    () =>
      Array.from({ length: playerCount }, (_, i) => ({
        index: i,
        name: names[i],
        placeholder: t("setup.playerPlaceholder", { n: i + 1 }),
        color: playerColor(i),
      })),
    [playerCount, names, t],
  )

  const startGame = () => {
    const active = names.slice(0, playerCount).map((n) => n.trim())

    if (active.some((n) => n.length === 0)) {
      setError(t("setup.errorNames"))
      return
    }
    const lower = active.map((n) => n.toLowerCase())
    if (new Set(lower).size !== lower.length) {
      setError(t("setup.errorDuplicate"))
      return
    }

    const payload: SetupPlayerInput[] = active.map((name) => ({
      id: makeId(),
      name,
    }))
    
    dispatch({
      type: "SET_GAME_RULES",
      payload: {
        arrivalBonus,
        penaltiesEnabled,
        penaltyMultiplier,
      },
    })

    dispatch({
      type: "START_GAME",
      payload: { players: payload, totalRounds },
    })
  }

  const exit = () => dispatch({ type: "EXIT_GAME" })

  return {
    t,
    playerCount,
    totalRounds,
    players,
    error,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    minRounds: MIN_ROUNDS,
    maxRounds: MAX_ROUNDS,
    arrivalBonus,
    toggleArrivalBonus: () => setArrivalBonus((v) => !v),
    penaltiesEnabled,
    togglePenaltiesEnabled: () => setPenaltiesEnabled((v) => !v),
    penaltyMultiplier,
    setPenaltyMultiplier,
    changeCount,
    changeName,
    changeRounds,
    startGame,
    exit,
  }

}
