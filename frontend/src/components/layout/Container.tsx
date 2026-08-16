import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type ContainerProps = {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'relative z-[1] mx-auto w-full max-w-[1200px] px-5 md:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
