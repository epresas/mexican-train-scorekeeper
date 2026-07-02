import { useTranslation } from "../i18n/useTranslation"

export const LanguageToggle = () => {
  const { lang, toggleLang } = useTranslation()
  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className="fixed right-4 top-4 z-40 flex items-center overflow-hidden rounded-lg border border-border bg-surface text-xs font-bold"
    >
      <span
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "es" ? "bg-primary text-bg" : "text-muted"
        }`}
      >
        ES
      </span>
      <span
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en" ? "bg-primary text-bg" : "text-muted"
        }`}
      >
        EN
      </span>
    </button>
  )
}
