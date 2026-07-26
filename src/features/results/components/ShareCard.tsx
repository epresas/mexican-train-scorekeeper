import { PLAYER_COLORS } from "../../../helpers/constants"

const MEDALS = ["🥇", "🥈", "🥉"]

export interface ShareCardBadge {
  emoji: string
  label: string
  value: string
}

export interface ShareCardRankedPlayer {
  id: string
  name: string
  total: number
  arrivalBonusTotal?: number
}

interface ShareCardProps {
  ranked: ShareCardRankedPlayer[]
  badges: ShareCardBadge[]
}

/**
 * Off-screen static card used ONLY as an html-to-image capture target.
 * - Never visible to the user in normal layout.
 * - Fixed 400px width — must not be responsive.
 * - No animations, no Motion, no useState/useEffect.
 * - Uses inline styles + PLAYER_COLORS so the image is correct regardless
 *   of Tailwind purging or device viewport.
 */
export const ShareCard = ({ ranked, badges }: ShareCardProps) => {
  return (
    <div
      id="share-card"
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: 400,
        backgroundColor: "#0F172A",
        borderRadius: 16,
        padding: "28px 24px",
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#F1F5F9",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          borderBottom: "1px solid #1E293B",
          paddingBottom: 16,
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          🚂 Tren Mexicano
        </p>
        <p
          style={{
            fontSize: 11,
            color: "#64748B",
            margin: "4px 0 0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Resultados finales · Final results
        </p>
      </div>

      {/* Ranked list */}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {ranked.map((r, i) => {
          const medal = i < 3 ? MEDALS[i] : null
          const color = PLAYER_COLORS[i % PLAYER_COLORS.length]
          const isWinner = i === 0
          const effectiveTotal =
            r.arrivalBonusTotal !== undefined ? r.arrivalBonusTotal : r.total

          return (
            <li
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: isWinner ? "rgba(245,158,11,0.08)" : "#1E293B",
                border: `1px solid ${isWinner ? "#F59E0B44" : "#334155"}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              {/* Position */}
              <span
                style={{
                  width: 28,
                  textAlign: "center",
                  fontSize: medal ? 18 : 14,
                  fontWeight: 900,
                  color: medal ? undefined : "#64748B",
                  flexShrink: 0,
                }}
              >
                {medal ?? i + 1}
              </span>

              {/* Color dot */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.name}
              </span>

              {/* Score */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 18,
                    fontWeight: 900,
                    color,
                  }}
                >
                  {effectiveTotal}
                </span>
                {r.arrivalBonusTotal !== undefined && (
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#64748B",
                    }}
                  >
                    ({r.total})
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* Badges */}
      {badges.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: badges.length === 1 ? "1fr" : "1fr 1fr",
            gap: 8,
          }}
        >
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                background: "#1E293B",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {b.emoji} {b.label}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#F1F5F9",
                }}
              >
                {b.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p
        style={{
          margin: "16px 0 0",
          fontSize: 10,
          color: "#334155",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        trenMexicano.app
      </p>
    </div>
  )
}
