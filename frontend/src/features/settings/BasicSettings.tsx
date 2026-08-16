import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { FORMAT_OPTIONS, QUALITY_OPTIONS } from '../../lib/constants/settings'
import type { ExportFormat, ExportQuality } from '../../types/settings'
import { AboutSettings } from './AboutSettings'
import { SettingCard } from './SettingCard'

type BasicSettingsProps = {
  defaultFormat: ExportFormat
  defaultQuality: ExportQuality
  onFormatChange: (value: ExportFormat) => void
  onQualityChange: (value: ExportQuality) => void
}

export function BasicSettings({
  defaultFormat,
  defaultQuality,
  onFormatChange,
  onQualityChange,
}: BasicSettingsProps) {
  return (
    <>
      <SettingCard
        title="デフォルトの画像形式"
        description="画像を書き出すときの初期形式を設定します。"
      >
        <SegmentedControl
          label="デフォルトの画像形式"
          value={defaultFormat}
          options={FORMAT_OPTIONS}
          onChange={onFormatChange}
        />
      </SettingCard>
      <SettingCard
        title="デフォルトの画質"
        description="画像を書き出すときの初期画質を設定します。"
      >
        <SegmentedControl
          label="デフォルトの画質"
          value={defaultQuality}
          options={QUALITY_OPTIONS}
          onChange={onQualityChange}
        />
      </SettingCard>
      <AboutSettings />
    </>
  )
}
