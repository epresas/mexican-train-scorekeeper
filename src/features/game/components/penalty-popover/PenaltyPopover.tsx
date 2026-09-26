import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { Check, X } from "lucide-react"
import { PopoverContent } from "./PopoverContent"
import type { TranslationKey, TranslateVars } from "@/shared/i18n/useTranslation"

export interface PenaltyPopoverProps {
  playerName: string
  playerId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  value: number
  onChange: (val: number) => void
  onConfirm: () => void
  onClose: () => void
  t: (key: TranslationKey, vars?: TranslateVars) => string
}

export interface Coords {
  top: number
  left: number
}


export const PenaltyPopover = ({
  playerName,
  playerId,
  triggerRef,
  value,
  onChange,
  onConfirm,
  onClose,
  t,
}: PenaltyPopoverProps) => {
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    })
  }, [triggerRef])

  return createPortal(
    <AnimatePresence>
      <PopoverContent
        playerName={playerName}
        value={value}
        onChange={onChange}
        onConfirm={onConfirm}
        onClose={onClose}
        t={t}
        coords={coords}
      />
    </AnimatePresence>,
    document.body,
  )
}
