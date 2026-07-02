import { useCallback, useEffect, useRef, useState } from "react"

interface UseTimerOptions {
  /** epoch ms to count elapsed seconds from. null pauses the timer. */
  startTime: number | null
  /** whether the timer should tick */
  running?: boolean
}

/** Reusable elapsed-seconds timer driven by a start timestamp. */
export const useTimer = ({ startTime, running = true }: UseTimerOptions) => {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (startTime === null || !running) {
      clear()
      if (startTime === null) setElapsed(0)
      return
    }

    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)))

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return clear
  }, [startTime, running, clear])

  return { elapsed }
}

/** Format seconds as mm:ss. */
export const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
