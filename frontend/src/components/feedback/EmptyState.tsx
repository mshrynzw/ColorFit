import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { LoadingIndicator } from './LoadingIndicator'

type EmptyStateTone = 'empty' | 'error' | 'loading'

type EmptyStateProps = {
  title: string
  description: string
  hint?: string
  action?: ReactNode
  tone?: EmptyStateTone
  icon?: ReactNode
  busy?: boolean
}

export function EmptyState({
  title,
  description,
  hint,
  action,
  tone = 'empty',
  icon,
  busy = false,
}: EmptyStateProps) {
  return (
    <div className="feedback-panel glass-panel">
      <div
        className={cn(
          'feedback-panel__icon',
          tone === 'error' && 'feedback-panel__icon--error',
          tone === 'loading' && 'feedback-panel__icon--loading',
        )}
        aria-hidden="true"
      >
        {icon ??
          (tone === 'loading' ? <LoadingIndicator /> : <DefaultIcon tone={tone} />)}
      </div>
      <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
      <p
        className="mt-3 max-w-md text-sm text-text-muted md:text-base"
        role={busy ? 'status' : undefined}
      >
        {description}
      </p>
      {hint ? <p className="mt-2 max-w-md text-sm text-text-subtle">{hint}</p> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}

function DefaultIcon({ tone }: { tone: EmptyStateTone }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M12 8v5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.2" r="1" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8.5" cy="10" r="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5 16.5l4.2-4.2 3 3 2.4-2.4 4.4 4.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
