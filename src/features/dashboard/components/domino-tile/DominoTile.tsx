export interface DominoProps {
  topPips: number
  bottomPips: number
}

const PIP_LAYOUT: Record<number, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

const Half = ({ top }: { top: number }) => (
  <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2">
    {Array.from({ length: 9 }).map((_, i) => (
      <span
        key={i}
        className={`h-1.5 w-1.5 rounded-full ${
          PIP_LAYOUT[top]?.includes(i) ? "bg-text-primary" : "bg-transparent"
        }`}
      />
    ))}
  </div>
)

export const DominoTile = ({ topPips, bottomPips }: DominoProps) => (
  <div className="flex flex-col rounded-lg border border-border bg-surface">
    <Half top={topPips} />
    <div className="h-px bg-border" />
    <Half top={bottomPips} />
  </div>
)
