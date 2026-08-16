import { cn } from '../../lib/cn'

type LoadingIndicatorProps = {
  label?: string
  className?: string
}

export function LoadingIndicator({ label, className }: LoadingIndicatorProps) {
  return (
    <span
      className={cn('loading-indicator', className)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.28"
        />
        <path
          d="M21 12a9 9 0 00-9-9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
