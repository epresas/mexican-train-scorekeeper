import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Modal } from "../../components/Modal"
import { Button } from "../../components/Button"
import { useTranslation } from "../../i18n/useTranslation"
import type { TranslationKey } from "../../i18n/es"

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

interface Step {
  emoji: string
  title: TranslationKey
  body: TranslationKey
}

const STEPS: Step[] = [
  { emoji: "🎯", title: "help.step1.title", body: "help.step1.body" },
  { emoji: "🔄", title: "help.step2.title", body: "help.step2.body" },
  { emoji: "🏁", title: "help.step3.title", body: "help.step3.body" },
  { emoji: "🔢", title: "help.step4.title", body: "help.step4.body" },
  { emoji: "🏆", title: "help.step5.title", body: "help.step5.body" },
]

const variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -60 }),
}

// NOTE: dumb component — receives open/onClose only; local step nav is
// self-contained UI state and lives in this presentational modal by design.
export const HelpModal = ({ open, onClose }: HelpModalProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleClose = () => {
    onClose()
    // reset for next open
    setStep(0)
    setDirection(1)
  }

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <Modal open={open} onClose={handleClose} title={t("help.title")}>
      {/* progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      </div>
      <p className="mb-4 text-xs uppercase tracking-wide text-muted">
        {t("help.progress", { current: step + 1, total: STEPS.length })}
      </p>

      <div className="relative min-h-[180px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 text-5xl" aria-hidden="true">
              {current.emoji}
            </div>
            <h3 className="mb-2 text-lg font-black tracking-tight text-text-primary text-balance">
              {t(current.title)}
            </h3>
            <p className="leading-relaxed text-muted text-pretty">
              {t(current.body)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => go(step - 1)}
          disabled={isFirst}
        >
          <ChevronLeft size={16} />
          {t("common.prev")}
        </Button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <Button variant="primary" onClick={handleClose}>
            {t("common.finish")}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => go(step + 1)}>
            {t("common.next")}
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </Modal>
  )
}
