import { useEffect, useState } from 'react'

import { useSettings } from './useSettings'

export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(mediaQuery.matches)
    }

    update()
    mediaQuery.addEventListener('change', update)
    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [])

  return reducedMotion
}

export function useReducedMotion(): boolean {
  const osReduced = usePrefersReducedMotion()
  const { settings } = useSettings()
  return osReduced || settings.reduceMotion || settings.uiAnimation === 'off'
}
