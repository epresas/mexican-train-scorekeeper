import { useState, useEffect } from "react";

export const EditableScoreCell = ({
  score,
  onSave,
  disabled,
}: {
  score: number;
  onSave: (val: number) => void;
  disabled?: boolean;
}) => {
  const [val, setVal] = useState(String(score));

  useEffect(() => {
    Promise.resolve().then(() => setVal(String(score)));
  }, [score]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={val}
      disabled={disabled}
      onChange={(e) => setVal(e.target.value.replace(/[^\d-]/g, ""))}
      onBlur={() => {
        if (disabled) return;
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed !== score) {
          onSave(parsed);
          setVal(String(parsed));
        } else {
          setVal(String(score));
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      className={`w-12 bg-transparent text-center font-mono text-base sm:text-sm font-black transition-colors ${
        disabled
          ? "text-success cursor-not-allowed opacity-100"
          : "text-text-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary rounded"
      }`}
    />
  );
};
