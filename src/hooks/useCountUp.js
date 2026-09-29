import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts from 0 to `value` the first time the element scrolls into view.
 * Falls back to the final value for users who prefer reduced motion.
 */
export function useCountUp(value, { duration = 1800, decimals = 0, start = true } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!start || !inView) return undefined
    if (reduced || !Number.isFinite(value)) {
      setDisplay(value)
      return undefined
    }

    let frame
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Number((value * eased).toFixed(decimals)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, decimals, inView, start])

  return { ref, value: display }
}
