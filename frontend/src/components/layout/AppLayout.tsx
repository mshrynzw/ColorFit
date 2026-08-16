import { Outlet } from 'react-router-dom'

import { SettingsProvider } from '../../hooks/useSettings'
import { BackgroundLayer } from './BackgroundLayer'
import { Footer } from './Footer'
import { Header } from './Header'
import { SkipLink } from './SkipLink'

export function AppLayout() {
  return (
    <SettingsProvider>
      <div className="relative min-h-svh bg-background text-text">
        <BackgroundLayer />
        <SkipLink />
        <Header />
        <Outlet />
        <Footer />
      </div>
    </SettingsProvider>
  )
}
