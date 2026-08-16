import type { ReactNode } from 'react'

type SettingCardProps = {
  title: string
  description: string
  action?: ReactNode
  value?: string
  note?: ReactNode
  children?: ReactNode
}

export function SettingCard({
  title,
  description,
  action,
  value,
  note,
  children,
}: SettingCardProps) {
  return (
    <article className="setting-card">
      <div className="setting-card__head">
        <div>
          <h2 className="setting-card__label">{title}</h2>
          <p className="setting-card__desc">{description}</p>
        </div>
        {action}
        {value ? <span className="setting-card__value">{value}</span> : null}
      </div>
      {children}
      {note}
    </article>
  )
}
