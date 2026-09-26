import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export const RankMovement = ({ delta }: { delta: number }) => {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-success">
        <ArrowUp size={12} aria-hidden="true" />
        {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-danger">
        <ArrowDown size={12} aria-hidden="true" />
        {Math.abs(delta)}
      </span>
    );
  }
  return <Minus size={12} className="text-muted" aria-hidden="true" />;
};
