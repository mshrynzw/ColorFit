export type ThemeMode = 'dark' | 'light' | 'system'
export type ExportFormat = 'webp' | 'jpeg' | 'png'
export type ExportQuality = 'high' | 'standard' | 'light'
export type AnimationMode = 'standard' | 'reduced' | 'off'
export type FilenameMode = 'original' | 'colorfit'
export type SettingsCategory =
  | 'basic'
  | 'appearance'
  | 'processing'
  | 'export'
  | 'animation'

export type AppSettings = {
  theme: ThemeMode
  defaultFormat: ExportFormat
  defaultQuality: ExportQuality
  autoAdjust: boolean
  adjustmentStrength: number
  naturalColorPriority: boolean
  filenameMode: FilenameMode
  preserveMetadata: boolean
  uiAnimation: AnimationMode
  processingAnimation: boolean
  reduceMotion: boolean
}
