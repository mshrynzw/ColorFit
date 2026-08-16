import { cn } from '../../lib/cn'

type SegmentedOption<T extends string> = {
  value: T
  label: string
  badge?: string
}

type SegmentedControlProps<T extends string> = {
  label: string
  value: T
  options: ReadonlyArray<SegmentedOption<T>>
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={cn('segmented__btn', selected && 'is-active')}
            aria-pressed={selected}
            onClick={() => {
              onChange(option.value)
            }}
          >
            {option.label}
            {option.badge ? (
              <span className="segmented__badge">{option.badge}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
