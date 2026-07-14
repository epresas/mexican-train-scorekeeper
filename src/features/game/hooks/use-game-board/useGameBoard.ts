import { useMemo, useState } from "react";
import { useGameContext } from "../../../../context/GameContext";
import { useTranslation } from "../../../../i18n/useTranslation";
import { playerTotal, standings } from "../../../../helpers/scoreHelpers";
import { playerColor } from "../../../../helpers/constants";

interface ScoreEntry {
  value: string;
  arrived: boolean;
}

const emptyEntry = (): ScoreEntry => ({ value: "", arrived: false });

export const useGameBoard = () => {
  const { state, dispatch } = useGameContext();
  const { t } = useTranslation();

  const [entries, setEntries] = useState<Record<string, ScoreEntry>>({});
  const [error, setError] = useState<string | null>(null);
  const [exitOpen, setExitOpen] = useState(false);

  // Penalty Popover state
  const [activePopoverPlayerId, setActivePopoverPlayerId] = useState<string | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(1);

  const rankInfo = useMemo(
    () => standings(state.players, state.rounds),
    [state.players, state.rounds],
  );

  const hasRounds = state.rounds.length > 0;

  const players = useMemo(
    () =>
      state.players.map((p, i) => {
        const rawTotal = playerTotal(p.id, state.rounds);
        const arrivalBonusTotal = p.arrivalBonusTotal ?? 0;
        const effective = rawTotal - arrivalBonusTotal;
        const isNegative = state.gameRules.arrivalBonus && effective < 0;

        // Clamp display to 0 — negative effective is a ranking advantage but
        // should never render as a number below zero.
        const totalDisplay = isNegative
          ? `0 (-${arrivalBonusTotal})`
          : String(effective);

        return {
          ...p,
          color: playerColor(i),
          total: totalDisplay,
          rank: rankInfo[p.id]?.rank ?? 0,
          rankDelta: rankInfo[p.id]?.delta ?? 0,
          entry: entries[p.id] ?? emptyEntry(),
          pendingPenalties: state.currentRoundPenalties[p.id] ?? 0,
        };
      }),
    [state.players, state.rounds, entries, state.gameRules, state.currentRoundPenalties, rankInfo],
  );

  const endRound = () => {
    setEntries(
      Object.fromEntries(state.players.map((p) => [p.id, emptyEntry()])),
    );
    setError(null);
    dispatch({ type: "END_ROUND" });
  };

  const setScore = (playerId: string, value: string) => {
    // allow only digits
    const clean = value.replace(/[^\d]/g, "");
    setEntries((prev) => ({
      ...prev,
      [playerId]: { ...(prev[playerId] ?? emptyEntry()), value: clean },
    }));
    setError(null);
  };

  const toggleArrived = (playerId: string) => {
    setEntries((prev) => {
      const current = prev[playerId] ?? emptyEntry();
      const arrived = !current.arrived;
      return {
        ...prev,
        [playerId]: {
          arrived,
          value: arrived ? "0" : "",
        },
      };
    });
    setError(null);
  };

  const submitRound = () => {
    const scores: Record<string, number> = {};
    const arrivals: Record<string, boolean> = {};

    for (const p of state.players) {
      const entry = entries[p.id] ?? emptyEntry();
      if (entry.value === "" || Number.isNaN(Number(entry.value))) {
        setError(t("game.errorScores"));
        return;
      }
      scores[p.id] = Number(entry.value);
      arrivals[p.id] = entry.arrived;
    }

    // Duration is measured silently from the round start — no live timer UI.
    const duration = state.roundStartTime
      ? Math.max(0, Math.floor((Date.now() - state.roundStartTime) / 1000))
      : 0;

    dispatch({
      type: "SUBMIT_ROUND",
      payload: { scores, arrivals, duration },
    });
    setEntries({});
  };

  const requestExit = () => setExitOpen(true);
  const cancelExit = () => setExitOpen(false);
  const confirmExit = () => {
    setExitOpen(false);
    dispatch({ type: "EXIT_GAME" });
  };

  const openPenaltyPopover = (playerId: string) => {
    setActivePopoverPlayerId(playerId);
    setPenaltyAmount(1);
  };

  const closePenaltyPopover = () => {
    setActivePopoverPlayerId(null);
  };

  const confirmPenalty = (playerId: string) => {
    dispatch({
      type: "ADD_PENALTY",
      payload: { playerId, amount: penaltyAmount },
    });
    closePenaltyPopover();
  };

  return {
    t,
    players,
    rounds: state.rounds,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    isInputPhase: state.isInputPhase,
    hasRounds,
    error,
    exitOpen,
    gameRules: state.gameRules,
    activePopoverPlayerId,
    penaltyAmount,
    endRound,
    setScore,
    toggleArrived,
    submitRound,
    requestExit,
    cancelExit,
    confirmExit,
    openPenaltyPopover,
    closePenaltyPopover,
    setPenaltyAmount,
    confirmPenalty,
  };
};

