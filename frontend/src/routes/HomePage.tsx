import { CtaSection } from '../features/home/CtaSection'
import { FeatureSection } from '../features/home/FeatureSection'
import { HeroSection } from '../features/home/HeroSection'
import { usePageTitle } from '../hooks/usePageTitle'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'

export function HomePage() {
  usePageTitle(PAGE_TITLES[ROUTES.home])

  return (
    <main id="main">
      <HeroSection />
      <FeatureSection />
      <CtaSection />
    </main>
  )
}
