export const ROUTES = {
  home: '/',
  editor: '/editor',
  result: '/result',
  settings: '/settings',
} as const

export const PAGE_LABELS = {
  [ROUTES.editor]: '画像を調整',
  [ROUTES.result]: '調整結果',
  [ROUTES.settings]: '設定',
} as const

export const PAGE_TITLES = {
  [ROUTES.home]: 'ColorFit ― Webデザインに、画像の色を合わせる。',
  [ROUTES.editor]: '画像を調整 ― ColorFit',
  [ROUTES.result]: '調整結果 ― ColorFit',
  [ROUTES.settings]: '設定 ― ColorFit',
} as const
