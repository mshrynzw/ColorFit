import { useEffect, type RefObject } from 'react'

import { loadGsap } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

export function useHomeEntrance(rootRef: RefObject<HTMLElement | null>) {
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
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

        timeline
          .fromTo(
            '[data-anim="fade-up"]',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          )
          .fromTo(
            '[data-anim="visual-scale"]',
            { opacity: 0, scale: 0.96, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.85 },
            '-=0.35',
          )
          .fromTo(
            '[data-anim="chip"]',
            { opacity: 0, y: 12, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.1,
              ease: 'back.out(1.6)',
            },
            '-=0.45',
          )

        gsap.fromTo(
          '[data-anim="feature-card"]',
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-anim="feature-grid"]',
              start: 'top 90%',
              once: true,
            },
          },
        )

        gsap.fromTo(
          '[data-anim="section-fade"]',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-anim="cta"]',
              start: 'top 92%',
              once: true,
            },
          },
        )
      }, rootRef)
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [reducedMotion, rootRef])
}
