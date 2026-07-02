import { AnimatePresence, motion } from "motion/react"
import { GameProvider, useGameContext } from "./context/GameContext"
import { I18nProvider } from "./i18n/useTranslation"
import { LanguageToggle } from "./components/LanguageToggle"
import { Dashboard } from "./features/dashboard/Dashboard"
import { GameSetup } from "./features/setup/GameSetup"
import { GameBoard } from "./features/game/GameBoard"
import { GameResults } from "./features/results/GameResults"

const screenTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const PhaseRouter = () => {
  const { state } = useGameContext()

  return (
    <div className="min-h-full">
      <LanguageToggle />
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

export const App = () => (
  <I18nProvider>
    <GameProvider>
      <PhaseRouter />
    </GameProvider>
  </I18nProvider>
)
