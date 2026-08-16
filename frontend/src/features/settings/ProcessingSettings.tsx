import { Switch } from '../../components/ui/Switch'
import { SettingCard } from './SettingCard'

type ProcessingSettingsProps = {
  autoAdjust: boolean
  adjustmentStrength: number
  naturalColorPriority: boolean
  onAutoAdjustChange: (value: boolean) => void
  onStrengthChange: (value: number) => void
  onNaturalChange: (value: boolean) => void
}

export function ProcessingSettings({
  autoAdjust,
  adjustmentStrength,
  naturalColorPriority,
  onAutoAdjustChange,
  onStrengthChange,
  onNaturalChange,
}: ProcessingSettingsProps) {
  return (
    <>
      <SettingCard
        title="自動調整を有効にする"
        description="画像を読み込んだとき、設定した配色をもとに自動調整を行います。"
        action={
          <Switch
            checked={autoAdjust}
            onChange={onAutoAdjustChange}
            label="自動調整を有効にする"
          />
        }
      />
      <SettingCard
        title="色調整の強度"
        description="Webデザインの配色を画像へ反映する強さを設定します。"
        value={`${adjustmentStrength}%`}
      >
        <div className="range-row">
          <span className="range-row__endlabel">弱い</span>
          <input
            type="range"
            className="accent-range settings-range"
            min={0}
            max={100}
            step={1}
            value={adjustmentStrength}
            aria-label="色調整の強度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={adjustmentStrength}
            aria-valuetext={`${adjustmentStrength}パーセント`}
            onChange={(event) => {
              onStrengthChange(Number(event.target.value))
            }}
          />
          <span className="range-row__endlabel">強い</span>
        </div>
      </SettingCard>
      <SettingCard
        title="自然な色味を優先"
        description="元画像の印象を保ちながら、デザインに馴染むよう調整します。"
        action={
          <Switch
            checked={naturalColorPriority}
            onChange={onNaturalChange}
            label="自然な色味を優先"
          />
        }
      />
    </>
  )
}
