import { useEffect, useState } from 'react'

import { useReducedMotion } from './useReducedMotion'

export function useCyclingMessage(
  messages: readonly string[],
  active: boolean,
  intervalMs = 1200,
): string | null {
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }
    if (reducedMotion || messages.length < 2) {
      return
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length)
    }, intervalMs)
    return () => {
      window.clearInterval(timer)
    }
  }, [active, intervalMs, messages, reducedMotion])

  if (!active || messages.length === 0) {
    return null
  }
  return messages[index] ?? messages[0]
}
