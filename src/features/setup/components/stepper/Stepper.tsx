import { Minus, Plus } from "lucide-react"

export const Stepper = ({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) => (
  <div>
    <p className="mb-2 text-xs uppercase tracking-wide text-muted">{label}</p>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="decrease"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-primary transition-colors hover:bg-border/50 disabled:opacity-40"
      >
        <Minus size={18} />
      </button>
      <span className="min-w-[3ch] text-center font-mono text-3xl font-black text-text-primary">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="increase"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-primary transition-colors hover:bg-border/50 disabled:opacity-40"
      >
        <Plus size={18} />
      </button>
    </div>
  </div>
)

