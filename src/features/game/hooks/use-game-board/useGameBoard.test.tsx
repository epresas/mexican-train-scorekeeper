import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useGameBoard } from "./useGameBoard"
import { GameProvider, useGameContext } from "../../../../context/GameContext"
import { ReactNode, useEffect } from "react"

import { I18nProvider } from "../../../../i18n/useTranslation"

const TestWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <I18nProvider>
      <GameProvider>{children}</GameProvider>
    </I18nProvider>
  )
}

// Helper hook to start a game for testing
const useTestSetup = () => {
  const { dispatch } = useGameContext()
  useEffect(() => {
    dispatch({
      type: "START_GAME",
      payload: {
        players: [
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Bob" },
          { id: "p3", name: "Charlie" },
        ],
        totalRounds: 13,
      },
    })
    dispatch({ type: "END_ROUND" })
  }, [dispatch])
}

describe("useGameBoard - toggleArrived single winner behavior", () => {
  it("enforces single arrived player in standard mode and clears previous arrived player", () => {
    const { result } = renderHook(
      () => {
        useTestSetup()
        return useGameBoard()
      },
      { wrapper: TestWrapper },
    )

    expect(result.current.players[0].entry.arrived).toBe(false)
    expect(result.current.players[1].entry.arrived).toBe(false)
    expect(result.current.players[2].entry.arrived).toBe(false)

    // Player 1 arrives
    act(() => {
      result.current.toggleArrived("p1")
    })

    expect(result.current.players[0].entry.arrived).toBe(true)
    expect(result.current.players[0].entry.value).toBe("0")
    expect(result.current.players[1].entry.arrived).toBe(false)

    // Player 2 enters score 15
    act(() => {
      result.current.setScore("p2", "15")
    })
    expect(result.current.players[1].entry.value).toBe("15")

    // Now Player 2 arrives (Player 1 should be unmarked and value cleared for editing)
    act(() => {
      result.current.toggleArrived("p2")
    })

    expect(result.current.players[0].entry.arrived).toBe(false)
    expect(result.current.players[0].entry.value).toBe("") // Unmarked, can now add points
    expect(result.current.players[1].entry.arrived).toBe(true)
    expect(result.current.players[1].entry.value).toBe("0")

    // Toggling Player 2 off
    act(() => {
      result.current.toggleArrived("p2")
    })

    expect(result.current.players[1].entry.arrived).toBe(false)
    expect(result.current.players[1].entry.value).toBe("")
  })
})
