import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useGameContext } from "@/store/game-context/GameContext"
import { useTranslation } from "@/shared/i18n/useTranslation"
import { LanguageToggle } from "@/shared/components/language-toggle/LanguageToggle"
import { Dashboard } from "@/features/dashboard/Dashboard"
import { GameSetup } from "@/features/setup/GameSetup"
import { GameBoard } from "@/features/game/GameBoard"
import { GameResults } from "@/features/results/GameResults"
import { useGamePersistence } from "@/store/use-game-persistence/useGamePersistence"

const screenTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export const PhaseRouter = () => {
  const { state, dispatch } = useGameContext()
  
  const {
    showRestoredBanner,
    setShowRestoredBanner,
    showWarningBanner,
    setShowWarningBanner,
  } = useGamePersistence(state, dispatch)

  const { t } = useTranslation()

  return (
    <div className="min-h-full">
      {(state.phase === "dashboard" || state.phase === "setup") && <LanguageToggle />}

      {/* Floating notifications */}
      <div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-md flex-col gap-2.5">
        <AnimatePresence>
          {showRestoredBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-slate-900/90 p-4 text-sm text-success backdrop-blur-md shadow-xl"
            >
              <span>{t("common.gameRestored")}</span>
              <button
                type="button"
                onClick={() => setShowRestoredBanner(false)}
                className="rounded-lg p-1 hover:bg-success/20 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {showWarningBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-slate-900/90 p-4 text-sm text-danger backdrop-blur-md shadow-xl"
            >
              <span>{t("common.storageWarning")}</span>
              <button
                type="button"
                onClick={() => setShowWarningBanner(false)}
                className="rounded-lg p-1 hover:bg-danger/20 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.phase}
          className="min-h-screen"
          initial={screenTransition.initial}
          animate={screenTransition.animate}
          exit={screenTransition.exit}
          transition={{ duration: 0.3 }}
        >
          {state.phase === "dashboard" && <Dashboard />}
          {state.phase === "setup" && <GameSetup />}
          {state.phase === "playing" && <GameBoard />}
          {state.phase === "results" && <GameResults />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
