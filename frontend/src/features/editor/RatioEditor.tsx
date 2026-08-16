import type { PaletteColor } from '../../types/palette'

type RatioEditorProps = {
  colors: PaletteColor[]
  onRatioChange: (id: string, ratio: number) => void
}

export function RatioEditor({ colors, onRatioChange }: RatioEditorProps) {
  const total = colors.reduce((sum, item) => sum + item.ratio, 0)

  return (
    <div>
      <h3 className="text-[14.5px] font-semibold">配色比率</h3>
      <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-text-subtle">
        3色のバランスをスライダーで調整できます。
      </p>
      <div
        className="mb-5 flex h-3 overflow-hidden rounded-full border border-glass-border"
        aria-hidden="true"
      >
        {colors.map((item) => (
          <span
            key={item.id}
            className="h-full"
            style={{ width: `${item.ratio}%`, background: item.color }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3.5">
        {colors.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[10px_4.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: item.color,
                boxShadow: `0 0 8px -1px ${item.color}`,
              }}
              aria-hidden="true"
            />
            <label htmlFor={`ratio-${item.id}`} className="text-[12.5px] text-text-muted">
              {item.label.replace('カラー', '')}
            </label>
            <input
              id={`ratio-${item.id}`}
              type="range"
              className="accent-range w-full"
              min={0}
              max={100}
              value={item.ratio}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.ratio}
              aria-describedby={`ratio-${item.id}-val`}
              onChange={(event) => {
                onRatioChange(item.id, Number(event.target.value))
              }}
            />
            <span
              id={`ratio-${item.id}-val`}
              className="text-right text-[12.5px] text-text-subtle"
            >
              {item.ratio}%
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-text-subtle">
        合計 <span className={total === 100 ? 'text-text' : 'text-error'}>{total}</span>%
      </p>
    </div>
  )
}
