type StrengthSliderProps = {
  value: number
  onChange: (value: number) => void
}

export function StrengthSlider({ value, onChange }: StrengthSliderProps) {
  const percent = Math.round(value * 100)

  return (
    <aside aria-label="色の適用強度">
      <div className="glass-panel p-6">
        <h2 className="text-[17px] font-bold">画像を調整</h2>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="strength-slider" className="text-[13.5px] font-medium text-text-muted">
              適用強度
            </label>
            <span className="text-[12.5px] text-text-subtle">{percent}%</span>
          </div>
          <input
            id="strength-slider"
            type="range"
            className="accent-range w-full"
            min={0}
            max={1}
            step={0.05}
            value={value}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={value}
            aria-valuetext={`弱いから強いまで、現在${percent}パーセント`}
            onChange={(event) => {
              onChange(Number(event.target.value))
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-text-subtle">
            <span>弱い</span>
            <span>強い</span>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-text-subtle">
            0は色を変えず、1はデザインの配色へ最も強く寄せます。
          </p>
        </div>
      </div>
    </aside>
  )
}
