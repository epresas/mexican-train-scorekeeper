import { GameProvider } from "@/store/GameContext"
import { I18nProvider } from "@/shared/i18n/useTranslation"
import { PhaseRouter } from "./components/PhaseRouter"

export const App = () => (
  <I18nProvider>
    <GameProvider>
      <PhaseRouter />
    </GameProvider>
  </I18nProvider>
)
