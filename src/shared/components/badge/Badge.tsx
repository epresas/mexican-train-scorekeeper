import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface BadgeProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  /** hex accent color for the icon chip */
  accent?: string
}

export const Badge = ({
  icon: Icon,
  label,
  value,
  accent = "#F59E0B",
}: BadgeProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg/40 p-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="truncate font-mono text-base font-black text-text-primary">
          {value}
        </p>
      </div>
    </div>
  )
}
