import { motion } from "motion/react"
import { Check, X } from "lucide-react"

interface PenaltyPopoverProps {
  playerName: string
  playerId: string
  value: number
  onChange: (val: number) => void
  onConfirm: () => void
  onClose: () => void
  t: (key: any, vars?: any) => string
}

export const PenaltyPopover = ({
  playerName,
  value,
  onChange,
  onConfirm,
  onClose,
  t,
}: PenaltyPopoverProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-1/2 top-full z-50 mt-2 w-48 translate-x-1/2 rounded-xl border border-border bg-slate-900 p-4 shadow-xl focus:outline-none"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold text-text-primary text-left">
            {t("game.addPenaltyTo", { name: playerName })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text-primary transition-colors"
            aria-label={t("common.close")}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1)
              onChange(val)
            }}
            className="w-16 rounded-lg border border-border bg-slate-800 px-2 py-1.5 font-mono text-sm font-black text-text-primary focus:border-danger focus:outline-none"
          />
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger text-white transition-colors hover:bg-danger/80"
            aria-label="Confirm"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
