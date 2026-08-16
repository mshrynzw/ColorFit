import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

type ButtonStyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-linear-to-br from-[#eef2ff] to-white text-background shadow-none hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(94,234,212,0.35),0_0_0_1px_rgba(94,234,212,0.4)]',
  secondary:
    'border-glass-border bg-glass text-text hover:border-primary/50 hover:bg-primary/10',
  ghost:
    'border-glass-border bg-glass text-text hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10',
  danger:
    'border-error/40 bg-error/10 text-error hover:bg-error/20',
}

const sizeClassName: Record<ButtonSize, string> = {
  small: 'px-5 py-2.5 text-sm',
  medium: 'px-7 py-3 text-[15px]',
  large: 'px-[34px] py-4 text-base',
}

export function getButtonClassName({
  variant = 'primary',
  size = 'medium',
  className,
}: ButtonStyleProps): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full border font-medium tracking-[0.02em] transition duration-300 ease-[var(--ease-out-soft)]',
    'disabled:pointer-events-none disabled:opacity-50',
    variantClassName[variant],
    sizeClassName[size],
    className,
  )
}
