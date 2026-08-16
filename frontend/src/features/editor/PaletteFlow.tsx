type PaletteFlowProps = {
  colors: Array<{ id: string; color: string }>
}

export function PaletteFlow({ colors }: PaletteFlowProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1" aria-hidden="true">
      {colors.map((item) => (
        <span
          key={item.id}
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: item.color,
            boxShadow: `0 0 8px -1px ${item.color}`,
          }}
        />
      ))}
      <span className="h-px flex-1 bg-linear-to-r from-border-strong to-transparent" />
    </div>
  )
}
