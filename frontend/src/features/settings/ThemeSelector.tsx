import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { THEME_OPTIONS } from '../../lib/constants/settings'
import type { ThemeMode } from '../../types/settings'

type ThemeSelectorProps = {
  value: ThemeMode
  onChange: (value: ThemeMode) => void
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <SegmentedControl
      label="テーマ"
      value={value}
      options={THEME_OPTIONS}
      onChange={onChange}
    />
  )
}
