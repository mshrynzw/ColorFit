import type {
  AnimationMode,
  AppSettings,
  ExportFormat,
  ExportQuality,
  FilenameMode,
  SettingsCategory,
  ThemeMode,
} from '../../types/settings'

export const SETTINGS_STORAGE_KEY = 'colorfit.settings'

export const APP_VERSION = '0.1.0'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultFormat: 'webp',
  defaultQuality: 'standard',
  autoAdjust: true,
  adjustmentStrength: 70,
  naturalColorPriority: true,
  filenameMode: 'original',
  preserveMetadata: true,
  uiAnimation: 'standard',
  processingAnimation: true,
  reduceMotion: false,
}

export const SETTINGS_CATEGORIES: ReadonlyArray<{
  id: SettingsCategory
  label: string
}> = [
  { id: 'basic', label: '基本設定' },
  { id: 'appearance', label: '外観' },
  { id: 'processing', label: '画像処理' },
  { id: 'export', label: '書き出し' },
  { id: 'animation', label: 'アニメーション' },
]

export const THEME_OPTIONS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'ダーク' },
  { value: 'light', label: 'ライト' },
  { value: 'system', label: 'システム設定' },
]

export const FORMAT_OPTIONS: ReadonlyArray<{
  value: ExportFormat
  label: string
  badge?: string
}> = [
  { value: 'webp', label: 'WebP', badge: '推奨' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
]

export const QUALITY_OPTIONS: ReadonlyArray<{
  value: ExportQuality
  label: string
}> = [
  { value: 'high', label: '高品質' },
  { value: 'standard', label: '標準' },
  { value: 'light', label: '軽量' },
]

export const FILENAME_OPTIONS: ReadonlyArray<{
  value: FilenameMode
  label: string
}> = [
  { value: 'original', label: '元のファイル名' },
  { value: 'colorfit', label: 'ColorFitを付ける' },
]

export const UI_ANIMATION_OPTIONS: ReadonlyArray<{
  value: AnimationMode
  label: string
}> = [
  { value: 'standard', label: '標準' },
  { value: 'reduced', label: '控えめ' },
  { value: 'off', label: '無効' },
]

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  webp: 'WebP',
  jpeg: 'JPEG',
  png: 'PNG',
}

export const QUALITY_LABELS: Record<ExportQuality, string> = {
  high: '高品質',
  standard: '標準',
  light: '軽量',
}
