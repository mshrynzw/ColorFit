import { DEFAULT_PALETTE } from '../../lib/constants/palette'
import type { AdjustmentPayload } from '../../types/palette'

type ResultInfoProps = {
  palette: AdjustmentPayload['palette']
  strength: number | null
}

export function ResultInfo({ palette, strength }: ResultInfoProps) {
  const percent = strength == null ? null : Math.round(strength * 100)

  return (
    <div className="flex flex-col gap-4">
      {palette.length > 0 ? (
        <section className="glass-panel p-6" aria-label="使用したデザインの配色">
          <h2 className="text-[17px] font-bold">使用したデザインの配色</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {palette.map((item) => {
              const label =
                DEFAULT_PALETTE.find((color) => color.name === item.name)?.label ??
                item.name
              return (
                <li key={item.name} className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 8px -1px ${item.color}`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="text-text-muted">{label.replace('カラー', '')}</span>
                      <span className="font-mono text-text-subtle">{item.color}</span>
                      <span className="text-text-subtle">{item.ratio}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${item.ratio}%`, background: item.color }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
      {percent != null ? (
        <section className="glass-panel p-6" aria-label="調整内容">
          <h2 className="text-[17px] font-bold">調整内容</h2>
          <p className="mt-4 flex items-center justify-between text-sm">
            <span className="text-text-muted">適用強度</span>
            <span>{percent}%</span>
          </p>
        </section>
      ) : null}
    </div>
  )
}
