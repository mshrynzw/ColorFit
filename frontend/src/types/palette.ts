export type PaletteColor = {
  id: string
  name: string
  label: string
  color: string
  ratio: number
}

export type AdjustmentPayload = {
  palette: Array<{
    name: string
    color: string
    ratio: number
  }>
  strength: number
}
