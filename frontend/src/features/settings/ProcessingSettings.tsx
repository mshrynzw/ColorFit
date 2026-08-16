import { SettingCard } from './SettingCard'

type ProcessingSettingsProps = {
  adjustmentStrength: number
  onStrengthChange: (value: number) => void
}

export function ProcessingSettings({
  adjustmentStrength,
  onStrengthChange,
}: ProcessingSettingsProps) {
  return (
    <>
      {/* 自動調整 ON/OFF は Editor の処理実行と未接続のため非表示
      <SettingCard
        title="自動調整を有効にする"
        description="画像を読み込んだとき、設定した配色をもとに自動調整を行います。"
      />
      */}
      <SettingCard
        title="色調整の強度"
        description="Editorで画像を開いたときの適用強度の初期値です。"
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
      {/* 自然な色味優先は Color Matching パラメータと未接続のため非表示
      <SettingCard
        title="自然な色味を優先"
        description="元画像の印象を保ちながら、デザインに馴染むよう調整します。"
      />
      */}
    </>
  )
}
