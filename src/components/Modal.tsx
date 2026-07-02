import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  /** hide the top-right close button */
  hideClose?: boolean
  maxWidth?: string
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  hideClose = false,
  maxWidth = "max-w-lg",
}: ModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${maxWidth} rounded-xl border border-border bg-surface p-6 shadow-xl`}
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          >
            {(title || !hideClose) && (
              <div className="mb-4 flex items-center justify-between gap-4">
                {title ? (
                  <h2 className="text-xl font-black tracking-tight text-text-primary text-balance">
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-border/50 hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
