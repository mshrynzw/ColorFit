import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { SettingsSaveButton } from '../../features/settings/SettingsSaveButton'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSettings } from '../../hooks/useSettings'
import { cn } from '../../lib/cn'
import { PAGE_LABELS, ROUTES } from '../../lib/constants/routes'
import { getGsap } from '../../lib/gsap'
import { ButtonLink } from '../ui/Button'

const HOME_NAV_ITEMS = [
  { href: '#features', label: 'ColorFitについて' },
  { href: '#how-it-works', label: '使い方' },
] as const

const APP_NAV_ITEMS = [
  { to: ROUTES.home, label: 'ホーム' },
  { to: ROUTES.editor, label: '画像を調整' },
  { to: ROUTES.result, label: '調整結果' },
  { to: ROUTES.settings, label: '設定' },
] as const

export function Header() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const { isDirty } = useSettings()
  const headerRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const isHome = location.pathname === ROUTES.home
  const isSettings = location.pathname === ROUTES.settings
  const pageLabel =
    location.pathname in PAGE_LABELS
      ? PAGE_LABELS[location.pathname as keyof typeof PAGE_LABELS]
      : undefined

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (reducedMotion || !headerRef.current) {
      return
    }

    const { gsap } = getGsap()
    const context = gsap.context(() => {
      gsap.from('[data-anim="header-in"]', {
        opacity: 0,
        y: -8,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      })
    }, headerRef)

    return () => {
      context.revert()
    }
  }, [reducedMotion, isHome])

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[100] border-b border-border bg-[rgb(6_7_10_/_0.55)] backdrop-blur-[16px]"
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1200px] items-center justify-between gap-6 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3" data-anim="header-in">
          <Link
            to={ROUTES.home}
            className="logo-mark shrink-0 text-xl"
            aria-label="ColorFit ホームへ"
          >
            ColorFit
          </Link>
          {pageLabel ? (
            <>
              <span className="text-text-subtle" aria-hidden="true">
                /
              </span>
              <span className="truncate text-sm text-text-muted">{pageLabel}</span>
            </>
          ) : null}
        </div>

        {isHome ? (
          <nav className="hidden md:block" aria-label="メインナビゲーション">
            <ul className="flex items-center gap-9">
              {HOME_NAV_ITEMS.map((item) => (
                <li key={item.href} data-anim="header-in">
                  <a
                    href={item.href}
                    className="text-[14.5px] text-text-muted transition-colors hover:text-text"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav className="hidden md:block" aria-label="メインナビゲーション">
            <ul className="flex items-center gap-6">
              {APP_NAV_ITEMS.filter((item) => item.to !== ROUTES.home).map(
                (item) => (
                  <li key={item.to} data-anim="header-in">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'text-sm transition-colors',
                          isActive ? 'text-primary' : 'text-text-muted hover:text-text',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isHome ? (
            <span className="hidden md:inline-flex" data-anim="header-in">
              <ButtonLink to={ROUTES.editor} size="small">
                はじめる
              </ButtonLink>
            </span>
          ) : isSettings ? (
            <span className="hidden items-center gap-3 md:inline-flex" data-anim="header-in">
              {isDirty ? <span className="unsaved-badge">未保存の変更</span> : null}
              <SettingsSaveButton size="small" />
            </span>
          ) : (
            <span className="hidden md:inline-flex" data-anim="header-in">
              <ButtonLink to={ROUTES.settings} variant="ghost" size="small">
                設定
              </ButtonLink>
            </span>
          )}

          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[10px] border border-border-strong md:hidden"
            aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            data-anim="header-in"
            onClick={() => {
              setMenuOpen((open) => !open)
            }}
          >
            <span
              className={cn(
                'h-px w-[18px] bg-text transition-transform duration-300',
                menuOpen && 'translate-y-[7px] rotate-45',
              )}
            />
            <span
              className={cn(
                'h-px w-[18px] bg-text transition-opacity duration-300',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'h-px w-[18px] bg-text transition-transform duration-300',
                menuOpen && '-translate-y-[7px] -rotate-45',
              )}
            />
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={cn(
          'border-t border-border bg-[rgb(8_9_13_/_0.92)] md:hidden',
          menuOpen ? 'block' : 'hidden',
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="px-8 pt-6 pb-4" aria-label="モバイルナビゲーション">
          <ul className="flex flex-col gap-4">
            {isHome
              ? HOME_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-lg text-text-muted"
                      onClick={() => {
                        setMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))
              : APP_NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'text-lg',
                          isActive ? 'text-primary' : 'text-text-muted',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
          </ul>
        </nav>
        {isHome ? (
          <div className="px-8 pb-7">
            <ButtonLink to={ROUTES.editor} className="w-full">
              はじめる
            </ButtonLink>
          </div>
        ) : isSettings ? (
          <div className="px-8 pb-7">
            <SettingsSaveButton className="w-full" />
          </div>
        ) : null}
      </div>
    </header>
  )
}
