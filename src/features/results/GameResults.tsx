import { BarChart3, RotateCcw, Trophy } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "../../components/Button"
import { StatsPanel } from "./StatsPanel"
import { useGameResults } from "./useGameResults"

export const GameResults = () => {
  const vm = useGameResults()

  return (
    <main className="relative mx-auto flex min-h-full w-full max-w-xl flex-col px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-bg">
          <Trophy size={30} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-text-primary">
          {vm.t("results.title")}
          <span aria-hidden="true"> 🏆</span>
        </h1>
      </div>

      <ol className="flex flex-col gap-3">
        {vm.ranked.map((r, i) => {
          const isWinner = r.rank === 1
          return (
            <motion.li
              key={r.player.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                isWinner
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex w-8 shrink-0 items-center justify-center">
                {r.medal ? (
                  isWinner ? (
                    <motion.span
                      className="text-2xl"
                      aria-hidden="true"
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {r.medal}
                    </motion.span>
                  ) : (
                    <span className="text-2xl" aria-hidden="true">
                      {r.medal}
                    </span>
                  )
                ) : (
                  <span className="font-mono text-lg font-black text-muted">
                    {r.rank}
                  </span>
                )}
              </div>

              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: r.color }}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-text-primary">
                  {r.player.name}
                </p>
                <p className="text-xs text-muted">
                  {r.player.arrivals} {vm.t("results.arrivals")}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="font-mono text-2xl font-black"
                  style={{ color: r.color }}
                >
                  {r.total}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {vm.t("results.points")}
                </p>
              </div>
            </motion.li>
          )
        })}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          onClick={vm.openStats}
          className="w-full"
        >
          <BarChart3 size={18} />
          {vm.t("results.viewStats")}
        </Button>
        <Button size="lg" onClick={vm.newGame} className="w-full">
          <RotateCcw size={18} />
          {vm.t("results.newGame")}
        </Button>
      </div>

      <StatsPanel
        open={vm.statsOpen}
        onClose={vm.closeStats}
        players={vm.players}
        rounds={vm.rounds}
        colorById={vm.colorById}
      />
    </main>
  )
}
