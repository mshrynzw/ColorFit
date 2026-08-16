import { cn } from '../../lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      className={cn('settings-switch', checked && 'is-on')}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked)
        }
      }}
    >
      <span className="settings-switch__thumb" />
    </button>
  )
}
