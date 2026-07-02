import React, { ChangeEvent } from "react";
import { useDominoScanner } from "../../hooks/use-domino-scanner/useDominoScanner";

interface DominoScannerProps {
  onPointsDetected: (points: number) => void;
  onError: (error: string) => void;
}

export const DominoScanner: React.FC<DominoScannerProps> = ({
  onPointsDetected,
  onError,
}) => {
  const { isProcessing, processImage } = useDominoScanner({
    onPointsDetected,
    onError,
  });

  const handleCapture = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processImage(files[0]);
  };

  return (
    <label
      className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border text-muted transition-all duration-200 active:scale-95 ${
        isProcessing
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-surface hover:border-muted hover:text-text-primary"
      }`}
    >
      {isProcessing ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <svg
          xmlns="http://w3.org"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      )}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
        disabled={isProcessing}
      />
    </label>
  );
};
