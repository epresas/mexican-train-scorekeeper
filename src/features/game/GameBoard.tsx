import {
  Check,
  LogOut,
  Flag,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/Button";
import { ExitConfirmModal } from "@/features/game/components/exit-confirm-modal/ExitConfirmModal";
import { DominoScanner } from "@/features/game/components/domino-scanner/DominoScanner";
import { useGameBoard } from "@/features/game/useGameBoard";
import { useCameraCheck } from "@/shared/hooks/use-camera-check/useCameraCheck";
import { PenaltyPopover } from "@/features/game/components/PenaltyPopover";
import { isFeatureEnabled } from "@/shared/config/featureFlags";
import { EditableScoreCell } from "@/features/game/components/EditableScoreCell";
import { RankMovement } from "@/features/game/components/RankMovement";


const cellContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cellChild = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1 },
};

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** Up/down/neutral movement vs. the previous round's standings. */


export const GameBoard = () => {
  const vm = useGameBoard();
  const { hasCamera, isLoading } = useCameraCheck();
  const [scannerError, setScannerError] = useState<string | null>(null);
  const showScanner = isFeatureEnabled("dominoScanner");
  const isArrivalsOnly = vm.gameRules.mode === "arrivalsOnly";

  return (
    <main className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {vm.t("common.round")}
          </p>
          <p className="font-mono text-2xl font-black text-text-primary">
            {vm.currentRound}
            <span className="text-muted">/{vm.totalRounds}</span>
          </p>
        </div>
      </header>

      {/* Score table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-muted">
                {vm.t("common.round")}
              </th>
              {vm.players.map((p) => (
                <th key={p.id} className="relative px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                      aria-hidden="true"
                    />
                    <span className="font-bold text-text-primary">
                      {p.name}
                    </span>
                    {vm.gameRules.penaltiesEnabled && (
                      <div className="relative">
                        <button
                          ref={vm.penaltyBtnRefs[p.id] as React.RefObject<HTMLButtonElement>}
                          type="button"
                          onClick={() => {
                            if (vm.activePopoverPlayerId === p.id) {
                              vm.closePenaltyPopover()
                            } else {
                              vm.openPenaltyPopover(p.id)
                            }
                          }}
                          className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-border/50 ${
                            p.pendingPenalties > 0 ? "text-danger" : "text-muted hover:text-text-primary"
                          }`}
                          aria-label={`Add penalty to ${p.name}`}
                        >
                          <AlertTriangle size={14} />
                          <AnimatePresence>
                            {p.pendingPenalties > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger font-mono text-[9px] font-bold text-white"
                              >
                                {p.pendingPenalties}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                        {vm.activePopoverPlayerId === p.id && (
                          <PenaltyPopover
                            playerName={p.name}
                            playerId={p.id}
                            triggerRef={vm.penaltyBtnRefs[p.id]}
                            value={vm.penaltyAmount}
                            onChange={vm.setPenaltyAmount}
                            onConfirm={() => vm.confirmPenalty(p.id)}
                            onClose={vm.closePenaltyPopover}
                            t={vm.t}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {vm.rounds.map((r) => (
              <motion.tr
                key={r.index}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-border/60"
              >
                <td className="px-3 py-2 font-mono text-muted">{r.index}</td>
                {vm.players.map((p) => (
                  <td
                    key={p.id}
                    className="px-3 py-2 text-center"
                  >
                    {isArrivalsOnly ? (
                      <span className="font-mono font-black text-text-primary">
                        {r.scores[p.id] ?? 0}
                      </span>
                    ) : (
                      <div className="flex justify-center items-center gap-1">
                        {r.arrivals?.[p.id] && <CheckCircle2 size={12} className="text-success" />}
                        <EditableScoreCell
                          score={r.scores[p.id] ?? 0}
                          disabled={r.arrivals?.[p.id]}
                          onSave={(val) => vm.editRoundScore(r.index, p.id, val)}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}

            {/* Active input row */}
            <AnimatePresence>
              {vm.isInputPhase && (
                <motion.tr
                  variants={cellContainer}
                  initial="hidden"
                  animate="show"
                  className="bg-bg/40"
                >
                  <td className="px-3 py-3 align-top">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-primary">
                      <Flag size={12} />
                      {vm.currentRound}
                    </span>
                  </td>
                  {vm.players.map((p) => (
                    <td key={p.id} className="px-2 py-3 align-top text-center">
                      <motion.div
                        variants={cellChild}
                        className="flex flex-col items-center gap-2"
                      >
                        {isArrivalsOnly ? (
                          <button
                            onClick={() => vm.toggleArrived(p.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                              p.entry.arrived
                                ? "bg-success text-bg shadow-sm"
                                : "border border-border text-muted hover:text-text-primary hover:border-primary"
                            }`}
                          >
                            <CheckCircle2 size={16} />
                            {vm.t("game.arrived")}
                          </button>
                        ) : (
                          <>
                            {/* Contenedor horizontal para alinear Input + Cámara */}
                            <div className="flex items-center gap-1.5">
                              <input
                                inputMode="numeric"
                                value={p.entry.value}
                                disabled={p.entry.arrived}
                                onChange={(e) => vm.setScore(p.id, e.target.value)}
                                placeholder="0"
                                className="w-16 rounded-lg border border-border bg-surface px-2 py-2 text-center font-mono text-base font-black text-text-primary placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-60"
                              />

                              {/* Inyección de escáner inteligente (Detrás de Feature Flag) */}
                              {showScanner && !isLoading && hasCamera && !p.entry.arrived && (
                                <DominoScanner
                                  onPointsDetected={(points) => {
                                    setScannerError(null);
                                    vm.setScore(p.id, String(points));
                                  }}
                                  onError={(msg) =>
                                    setScannerError(`${p.name}: ${msg}`)
                                  }
                                />
                              )}
                            </div>

                            <button
                              onClick={() => vm.toggleArrived(p.id)}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                p.entry.arrived
                                  ? "bg-success text-bg"
                                  : "border border-border text-muted hover:text-text-primary"
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              {vm.t("game.arrived")}
                            </button>
                          </>
                        )}
                      </motion.div>
                    </td>
                  ))}
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-border">
              <td className="px-3 py-3 text-xs uppercase tracking-wide text-muted">
                {vm.t("game.runningTotal")}
              </td>
              {vm.players.map((p) => {
                const medal = vm.hasRounds ? MEDALS[p.rank] : undefined;
                return (
                  <td key={p.id} className="px-3 py-3 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="font-mono text-lg font-black"
                        style={{ color: p.color }}
                      >
                        {p.total}
                      </span>
                      {vm.hasRounds && (
                        <span className="flex items-center gap-1.5">
                          {medal && (
                            <span
                              className="text-sm leading-none"
                              aria-label={`${vm.t("common.rank")} ${p.rank}`}
                            >
                              {medal}
                            </span>
                          )}
                          <RankMovement delta={p.rankDelta} />
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Renderizado de errores (tanto de validación global como de escáner) */}
      {(vm.error || scannerError) && (
        <p
          role="alert"
          className="mt-4 text-sm font-bold text-danger text-center"
        >
          {vm.error || scannerError}
        </p>
      )}

      {/* Footer actions */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        {vm.isInputPhase ? (
          <Button size="lg" onClick={vm.submitRound} className="w-full sm:w-auto">
            <Check size={18} />
            {vm.t("game.confirmScores")}
          </Button>
        ) : (
          <Button size="lg" variant="primary" onClick={vm.endRound} className="w-full sm:w-auto">
            <Flag size={18} />
            {vm.t("game.endRound")}
          </Button>
        )}
        <Button 
          size="lg" 
          variant="ghost" 
          onClick={vm.requestExit} 
          className="w-full sm:w-auto text-danger hover:bg-danger/10 hover:text-danger border border-transparent hover:border-danger/20"
        >
          <LogOut size={18} />
          {vm.t("game.exit")}
        </Button>
      </div>

      <ExitConfirmModal
        open={vm.exitOpen}
        onStay={vm.cancelExit}
        onConfirm={vm.confirmExit}
      />
    </main>
  );
};
