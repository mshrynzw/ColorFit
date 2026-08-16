import { useEffect, type RefObject } from 'react'

import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

export function useEditorEntrance(
  rootRef: RefObject<HTMLElement | null>,
) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !rootRef.current) {
      return
    }

    let cancelled = false
    let context: { revert: () => void } | undefined

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !rootRef.current) {
        return
      }
      context = gsap.context(() => {
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
        timeline
          .from('[data-anim="panel-left"]', {
            opacity: 0,
            x: -24,
            duration: 0.55,
          })
          .from(
            '[data-anim="panel-canvas"]',
            { opacity: 0, y: 16, duration: 0.55 },
            '-=0.35',
          )
          .from(
            '[data-anim="panel-right"]',
            { opacity: 0, x: 24, duration: 0.55 },
            '-=0.4',
          )
      }, rootRef)
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [reducedMotion, rootRef])
}
