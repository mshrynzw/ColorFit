import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { SettingsProvider } from '../../hooks/useSettings'
import { ErrorBoundary } from '../feedback/ErrorBoundary'
import { BackgroundLayer } from './BackgroundLayer'
import { Footer } from './Footer'
import { Header } from './Header'
import { PageLoading } from './PageLoading'
import { SkipLink } from './SkipLink'

export function AppLayout() {
  return (
    <SettingsProvider>
      <div className="relative min-h-svh bg-background text-text">
        <BackgroundLayer />
        <SkipLink />
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </SettingsProvider>
  )
}
