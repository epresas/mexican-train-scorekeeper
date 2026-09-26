import { DominoTile } from "./components/domino-tile/DominoTile"


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
