import { GameProvider } from "@/store/game-context/GameContext"
import { I18nProvider } from "@/shared/i18n/useTranslation"
import { PhaseRouter } from "./components/phase-router/PhaseRouter"

export const App = () => (
  <I18nProvider>
    <GameProvider>
      <PhaseRouter />
    </GameProvider>
  </I18nProvider>
)
