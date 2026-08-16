type PaletteColorItemProps = {
  id: string
  label: string
  color: string
  hexValue: string
  onColorChange: (color: string) => void
}

export function PaletteColorItem({
  id,
  label,
  color,
  hexValue,
  onColorChange,
}: PaletteColorItemProps) {
  const pickerId = `${id}-picker`
  const hexId = `${id}-hex`

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={hexId} className="text-[13.5px] font-medium text-text-muted">
          {label}
        </label>
        <span className="font-mono text-xs text-text-subtle">{color}</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-full border border-glass-border bg-glass p-1.5 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_rgba(94,234,212,0.12)]">
        <input
          id={pickerId}
          type="color"
          className="color-swatch h-[30px] w-[30px] shrink-0 cursor-pointer rounded-full border border-glass-border p-0"
          value={color.toLowerCase()}
          aria-label={`${label}をカラーピッカーで選択`}
          onChange={(event) => {
            onColorChange(event.target.value)
          }}
        />
        <input
          id={hexId}
          type="text"
          className="min-w-0 flex-1 bg-transparent px-1 py-1.5 font-mono text-[13px] tracking-[0.02em] text-text outline-none"
          value={hexValue}
          maxLength={7}
          autoComplete="off"
          spellCheck={false}
          aria-label={`${label} HEXコード`}
          onChange={(event) => {
            onColorChange(event.target.value)
          }}
        />
      </div>
    </div>
  )
}
