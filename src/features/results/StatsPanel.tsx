import { Award, Clock, Hourglass, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Modal } from "../../components/Modal";
import { Badge } from "../../components/Badge";
import { useTranslation } from "../../i18n/useTranslation";
import { cumulativeSeries } from "../../helpers/scoreHelpers";
import {
  longestRound,
  mostArrivals,
  mostRoundsAsLast,
  totalTime,
} from "../../helpers/statsHelpers";
import { formatDuration } from "../../hooks/useTimer/useTimer";
import type { Player, Round } from "../../types/game.types";

interface StatsPanelProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  rounds: Round[];
  colorById: Record<string, string>;
}

// NOTE: presentational modal — receives all data via props, no context/state logic.
export const StatsPanel = ({
  open,
  onClose,
  players,
  rounds,
  colorById,
}: StatsPanelProps) => {
  const { t } = useTranslation();

  const data = cumulativeSeries(players, rounds);
  const arrivalsLeader = mostArrivals(players);
  const lastLeader = mostRoundsAsLast(players);
  const none = t("stats.none");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("stats.title")}
      maxWidth="max-w-2xl"
    >
      <p className="mb-3 text-xs uppercase tracking-wide text-muted">
        {t("stats.scoreProgression")}
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              dataKey="round"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                color: "#F1F5F9",
              }}
              labelStyle={{ color: "#64748B" }}
            />
            {players.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={colorById[p.id]}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Badge
          icon={Award}
          accent="#10B981"
          label={t("stats.mostArrivals")}
          value={
            arrivalsLeader
              ? `${arrivalsLeader.name} (${arrivalsLeader.arrivals})`
              : none
          }
        />
        <Badge
          icon={TrendingDown}
          accent="#EF4444"
          label={t("stats.mostLast")}
          value={
            lastLeader
              ? `${lastLeader.name} (${lastLeader.roundsAsLast})`
              : none
          }
        />
        <Badge
          icon={Clock}
          accent="#3B82F6"
          label={t("stats.totalTime")}
          value={formatDuration(totalTime(rounds))}
        />
        <Badge
          icon={Hourglass}
          accent="#F59E0B"
          label={t("stats.longestRound")}
          value={formatDuration(longestRound(rounds))}
        />
      </div>
    </Modal>
  );
};
