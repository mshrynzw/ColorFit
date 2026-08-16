export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export const DEFAULT_PALETTE = [
  {
    id: 'primary',
    name: 'primary',
    label: 'メインカラー',
    color: '#1E3A5F',
    ratio: 75,
  },
  {
    id: 'secondary',
    name: 'secondary',
    label: 'サブカラー',
    color: '#D8B26E',
    ratio: 20,
  },
  {
    id: 'accent',
    name: 'accent',
    label: 'アクセントカラー',
    color: '#F5F1E8',
    ratio: 5,
  },
] as const

export const DEFAULT_STRENGTH = 0.7
export const RATIO_SUM = 100
