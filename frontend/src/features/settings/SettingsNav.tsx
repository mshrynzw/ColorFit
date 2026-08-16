import { cn } from '../../lib/cn'
import { SETTINGS_CATEGORIES } from '../../lib/constants/settings'
import type { SettingsCategory } from '../../types/settings'

type SettingsNavProps = {
  category: SettingsCategory
  onChange: (category: SettingsCategory) => void
}

export function SettingsNav({ category, onChange }: SettingsNavProps) {
  return (
    <>
      <nav className="settings-nav" aria-label="設定カテゴリ" data-anim="nav">
        <div
          className="settings-tablist"
          role="tablist"
          aria-label="設定カテゴリ"
        >
          {SETTINGS_CATEGORIES.map((item, index) => {
            const selected = item.id === category
            return (
              <button
                key={item.id}
                type="button"
                className={cn('settings-tab', selected && 'is-active')}
                role="tab"
                id={`tab-${item.id}`}
                aria-controls={`panel-${item.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  onChange(item.id)
                }}
                onKeyDown={(event) => {
                  const last = SETTINGS_CATEGORIES.length - 1
                  let nextIndex: number | null = null
                  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % SETTINGS_CATEGORIES.length
                  }
                  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    nextIndex = (index - 1 + SETTINGS_CATEGORIES.length) % SETTINGS_CATEGORIES.length
                  }
                  if (event.key === 'Home') {
                    nextIndex = 0
                  }
                  if (event.key === 'End') {
                    nextIndex = last
                  }
                  if (nextIndex === null) {
                    return
                  }
                  const nextCategory = SETTINGS_CATEGORIES[nextIndex]
                  if (!nextCategory) {
                    return
                  }
                  event.preventDefault()
                  onChange(nextCategory.id)
                  requestAnimationFrame(() => {
                    document.getElementById(`tab-${nextCategory.id}`)?.focus()
                  })
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
      <div className="settings-select-wrap" data-anim="nav">
        <label htmlFor="settings-category-select" className="settings-select-label">
          設定カテゴリ
        </label>
        <select
          id="settings-category-select"
          className="settings-select"
          value={category}
          onChange={(event) => {
            onChange(event.target.value as SettingsCategory)
          }}
        >
          {SETTINGS_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
