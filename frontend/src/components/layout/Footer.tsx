import { Link } from 'react-router-dom'

import { ROUTES } from '../../lib/constants/routes'

export function Footer() {
  return (
    <footer className="relative z-1 border-t border-border py-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-4 px-5 md:flex-row md:items-center md:px-8">
        <Link to={ROUTES.home} className="logo-mark text-lg" aria-label="ColorFit ホームへ">
          ColorFit
        </Link>
        <p className="text-sm text-text-subtle">
          &copy; 2026 ColorFit. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
