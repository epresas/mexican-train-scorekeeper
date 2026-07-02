interface DominoProps {
  topPips: number
  bottomPips: number
}

// pip positions on a 3x3 grid (index 0-8)
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

const DominoTile = ({ topPips, bottomPips }: DominoProps) => (
  <div className="flex flex-col rounded-lg border border-border bg-surface">
    <Half top={topPips} />
    <div className="h-px bg-border" />
    <Half top={bottomPips} />
  </div>
)

const TILES = [
  { rotate: -18, left: "6%", top: "12%", topPips: 6, bottomPips: 3 },
  { rotate: 12, left: "78%", top: "8%", topPips: 5, bottomPips: 5 },
  { rotate: 24, left: "16%", top: "68%", topPips: 2, bottomPips: 4 },
  { rotate: -10, left: "84%", top: "62%", topPips: 6, bottomPips: 1 },
  { rotate: 30, left: "50%", top: "82%", topPips: 3, bottomPips: 0 },
  { rotate: -28, left: "44%", top: "4%", topPips: 4, bottomPips: 6 },
]

export const DominoBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]"
  >
    {TILES.map((t, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: t.left,
          top: t.top,
          transform: `rotate(${t.rotate}deg) scale(1.4)`,
        }}
      >
        <DominoTile topPips={t.topPips} bottomPips={t.bottomPips} />
      </div>
    ))}
  </div>
)
