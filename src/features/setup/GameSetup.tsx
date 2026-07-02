import { Minus, Plus, Play, ArrowLeft } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "../../components/Button"
import { useGameSetup } from "./useGameSetup"

const Stepper = ({
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

export const GameSetup = () => {
  const vm = useGameSetup()

  return (
    <main className="relative mx-auto flex min-h-full w-full max-w-xl flex-col px-6 py-16">
      <button
        onClick={vm.exit}
        className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        {vm.t("dashboard.hero")}
      </button>

      <h1 className="text-3xl font-black tracking-tight text-text-primary">
        {vm.t("setup.title")}
      </h1>

      <div className="mt-8 flex flex-col gap-8 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Stepper
            label={vm.t("setup.playerCount")}
            value={vm.playerCount}
            min={vm.minPlayers}
            max={vm.maxPlayers}
            onChange={vm.changeCount}
          />
          <Stepper
            label={vm.t("setup.roundCount")}
            value={vm.totalRounds}
            min={vm.minRounds}
            max={vm.maxRounds}
            onChange={vm.changeRounds}
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-muted">
            {vm.t("setup.playerNames")}
          </p>
          <div className="flex flex-col gap-2.5">
            {vm.players.map((p) => (
              <motion.div
                key={p.index}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                />
                <input
                  value={p.name}
                  onChange={(e) => vm.changeName(p.index, e.target.value)}
                  placeholder={p.placeholder}
                  maxLength={16}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {vm.error && (
          <p role="alert" className="text-sm font-bold text-danger">
            {vm.error}
          </p>
        )}

        <Button size="lg" onClick={vm.startGame} className="w-full">
          <Play size={18} />
          {vm.t("setup.startGame")}
        </Button>
      </div>
    </main>
  )
}
