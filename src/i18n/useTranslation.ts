import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { es, type TranslationKey } from "./es"
import { en } from "./en"

export type Lang = "es" | "en"

const translations: Record<Lang, Record<TranslationKey, string>> = { es, en }

type TranslateVars = Record<string, string | number>

interface I18nContextValue {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey, vars?: TranslateVars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const interpolate = (template: string, vars?: TranslateVars) => {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  )
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("es")

  const toggleLang = useCallback(
    () => setLang((l) => (l === "es" ? "en" : "es")),
    [],
  )

  const t = useCallback(
    (key: TranslationKey, vars?: TranslateVars) =>
      interpolate(translations[lang][key] ?? key, vars),
    [lang],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ lang, toggleLang, t }),
    [lang, toggleLang, t],
  )

  return createElement(I18nContext.Provider, { value }, children)
}

export const useTranslation = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return ctx
}
