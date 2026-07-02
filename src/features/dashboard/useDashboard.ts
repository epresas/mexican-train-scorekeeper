import { useState } from "react"
import { useGameContext } from "../../context/GameContext"
import { useTranslation } from "../../i18n/useTranslation"

export const useDashboard = () => {
  const { dispatch } = useGameContext()
  const { t } = useTranslation()
  const [helpOpen, setHelpOpen] = useState(false)

  const startPlay = () => dispatch({ type: "GO_SETUP" })
  const openHelp = () => setHelpOpen(true)
  const closeHelp = () => setHelpOpen(false)

  return { t, helpOpen, startPlay, openHelp, closeHelp }
}
