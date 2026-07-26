import { useState } from "react"
import type { Player, Round } from "../../types/game.types"
import { generateShareImage, shareImageNative } from "../../helpers/shareHelpers"
import { rankPlayers } from "../../helpers/scoreHelpers"
import {
  getHighestSingleRoundScore,
  mostArrivals,
  totalTime,
} from "../../helpers/statsHelpers"
import { formatDuration } from "../../hooks/useTimer/useTimer"
import { useTranslation } from "../../i18n/useTranslation"
import { isFeatureEnabled } from "../../config/featureFlags"
import type { ShareCardBadge, ShareCardRankedPlayer } from "./components/ShareCard"

/**
 * VM hook for the "Share result" feature.
 *
 * Derives the data needed for the ShareCard (ranked list + fun stat badges)
 * from the existing players/rounds data — no new state shape needed.
 *
 * isShareSupported: true when navigator.share is available (feature-detect
 * at hook initialisation time, not UA sniffing).
 */
export const useShareResults = (players: Player[], rounds: Round[]) => {
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Feature flag + Web Share API capability — both must be true for the button to appear
  const isShareSupported =
    isFeatureEnabled("shareResults") &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"

  // Build the ranked array in the shape ShareCard expects.
  // arrivalBonusTotal is only passed when the player has any bonus.
  const ranked: ShareCardRankedPlayer[] = rankPlayers(players, rounds).map((r) => ({
    id: r.player.id,
    name: r.player.name,
    total: r.total,
    ...(r.player.arrivalBonusTotal > 0
      ? { arrivalBonusTotal: r.total - r.player.arrivalBonusTotal }
      : {}),
  }))

  // Derive 2–3 fun stat badges from existing helpers
  const badges: ShareCardBadge[] = []

  const arrivalsLeader = mostArrivals(players)
  if (arrivalsLeader) {
    badges.push({
      emoji: "🚉",
      label: "Más llegadas",
      value: `${arrivalsLeader.name} (${arrivalsLeader.arrivals})`,
    })
  }

  const highestRound = getHighestSingleRoundScore(rounds, players)
  if (highestRound) {
    badges.push({
      emoji: "🔥",
      label: "Mayor ronda",
      value: `${highestRound.player.name} · ${highestRound.score}`,
    })
  }

  const gameDuration = totalTime(rounds)
  if (gameDuration > 0) {
    badges.push({
      emoji: "⏱️",
      label: "Tiempo total",
      value: formatDuration(gameDuration),
    })
  }

  const handleShare = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const blob = await generateShareImage("share-card")
      await shareImageNative(blob, "tren-mexicano-resultado.png", "Tren Mexicano")
    } catch {
      setError(t("results.shareError"))
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    ranked,
    badges,
    handleShare,
    isGenerating,
    error,
    isShareSupported,
  }
}
