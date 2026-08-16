import { PaletteColorItem } from './PaletteColorItem'
import { RatioEditor } from './RatioEditor'
import type { PaletteColor } from '../../types/palette'

type PaletteEditorProps = {
  colors: PaletteColor[]
  hexValue: (item: PaletteColor) => string
  errorMessage: string | null
  onColorChange: (id: string, color: string) => void
  onRatioChange: (id: string, ratio: number) => void
}

export function PaletteEditor({
  colors,
  hexValue,
  errorMessage,
  onColorChange,
  onRatioChange,
}: PaletteEditorProps) {
  return (
    <aside aria-label="デザインの配色設定">
      <div className="glass-panel p-6">
        <h2 className="text-[17px] font-bold">デザインの配色</h2>
        <p className="mt-2 mb-5 text-[13px] leading-relaxed text-text-subtle">
          画像を合わせたいWebデザインのカラーを設定してください。
        </p>
        <div className="flex flex-col gap-[18px]">
          {colors.map((item) => (
            <PaletteColorItem
              key={item.id}
              id={item.id}
              label={item.label}
              color={item.color}
              hexValue={hexValue(item)}
              onColorChange={(color) => {
                onColorChange(item.id, color)
              }}
            />
          ))}
        </div>
        <div className="my-[22px] h-px bg-border" role="separator" />
        <RatioEditor colors={colors} onRatioChange={onRatioChange} />
        {errorMessage ? (
          <p role="alert" className="mt-4 text-sm text-error">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </aside>
  )
}
