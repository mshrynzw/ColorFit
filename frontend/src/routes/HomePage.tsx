import { useRef } from 'react'

import { CtaSection } from '../features/home/CtaSection'
import { FeatureSection } from '../features/home/FeatureSection'
import { HeroSection } from '../features/home/HeroSection'
import { useHomeEntrance } from '../hooks/useHomeEntrance'
import { usePageTitle } from '../hooks/usePageTitle'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'

export function HomePage() {
  usePageTitle(PAGE_TITLES[ROUTES.home])
  const rootRef = useRef<HTMLElement>(null)
  useHomeEntrance(rootRef)

  return (
    <main id="main" ref={rootRef}>
      <HeroSection />
      <FeatureSection />
      <CtaSection />
    </main>
  )
}
