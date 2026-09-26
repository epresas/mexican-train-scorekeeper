import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import type { TranslationKey, TranslateVars } from "@/shared/i18n/useTranslation"

export interface Coords {
  top: number
  left: number
}

import type { PenaltyPopoverProps } from "./PenaltyPopover"

export const PopoverContent = ({
  playerName,
  value,
  onChange,
  onConfirm,
  onClose,
  t,
  coords,
}: Omit<PenaltyPopoverProps, "triggerRef" | "playerId"> & { coords: Coords }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -6 }}
    transition={{ duration: 0.15 }}
    style={{
      position: "fixed",
      top: coords.top,
      left: coords.left,
      transform: "translateX(-50%)",
      zIndex: 9999,
    }}
    className="w-52 rounded-xl border border-border bg-slate-900 p-4 shadow-2xl"
  >
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-text-primary text-left leading-snug">
          {t("game.addPenaltyTo", { name: playerName })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-muted hover:text-text-primary transition-colors"
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
          autoFocus
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

