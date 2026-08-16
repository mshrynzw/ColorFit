import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
  type ButtonSize,
  type ButtonVariant,
  getButtonClassName,
} from './button-styles'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'medium',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  )
}

type ButtonLinkProps = {
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'medium',
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link to={to} className={getButtonClassName({ variant, size, className })}>
      {children}
    </Link>
  )
}
