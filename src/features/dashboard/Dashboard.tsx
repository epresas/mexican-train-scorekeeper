import { HelpCircle, Play, TrainFront } from "lucide-react"
import { Button } from "../../components/Button"
import { DominoBackground } from "./DominoBackground"
import { HelpModal } from "./HelpModal"
import { useDashboard } from "./useDashboard"

export const Dashboard = () => {
  const vm = useDashboard()

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6 py-16">
      <DominoBackground />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-bg">
          <TrainFront size={36} />
        </div>

        <h1 className="text-5xl font-black tracking-tight text-text-primary text-balance">
          {vm.t("dashboard.hero")}
          <span aria-hidden="true"> 🚂</span>
        </h1>
        <p className="mt-4 max-w-sm leading-relaxed text-muted text-pretty">
          {vm.t("dashboard.tagline")}
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button size="lg" onClick={vm.startPlay} className="w-full">
            <Play size={18} />
            {vm.t("dashboard.play")}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={vm.openHelp}
            className="w-full"
          >
            <HelpCircle size={18} />
            {vm.t("dashboard.howToPlay")}
          </Button>
        </div>
      </div>

      <HelpModal open={vm.helpOpen} onClose={vm.closeHelp} />
    </main>
  )
}
