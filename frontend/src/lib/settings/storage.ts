import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '../constants/settings'
import type {
  AnimationMode,
  AppSettings,
  ExportFormat,
  ExportQuality,
  FilenameMode,
  ThemeMode,
} from '../../types/settings'

function isTheme(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light' || value === 'system'
}

function isFormat(value: unknown): value is ExportFormat {
  return value === 'webp' || value === 'jpeg' || value === 'png'
}

function isQuality(value: unknown): value is ExportQuality {
  return value === 'high' || value === 'standard' || value === 'light'
}

function isFilenameMode(value: unknown): value is FilenameMode {
  return value === 'original' || value === 'colorfit'
}

function isAnimationMode(value: unknown): value is AnimationMode {
  return value === 'standard' || value === 'reduced' || value === 'off'
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isStrength(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

export function parseSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS }
  }

  const input = raw as Partial<AppSettings>
  return {
    theme: isTheme(input.theme) ? input.theme : DEFAULT_SETTINGS.theme,
    defaultFormat: isFormat(input.defaultFormat)
      ? input.defaultFormat
      : DEFAULT_SETTINGS.defaultFormat,
    defaultQuality: isQuality(input.defaultQuality)
      ? input.defaultQuality
      : DEFAULT_SETTINGS.defaultQuality,
    autoAdjust: isBoolean(input.autoAdjust)
      ? input.autoAdjust
      : DEFAULT_SETTINGS.autoAdjust,
    adjustmentStrength: isStrength(input.adjustmentStrength)
      ? Math.round(input.adjustmentStrength)
      : DEFAULT_SETTINGS.adjustmentStrength,
    naturalColorPriority: isBoolean(input.naturalColorPriority)
      ? input.naturalColorPriority
      : DEFAULT_SETTINGS.naturalColorPriority,
    filenameMode: isFilenameMode(input.filenameMode)
      ? input.filenameMode
      : DEFAULT_SETTINGS.filenameMode,
    preserveMetadata: isBoolean(input.preserveMetadata)
      ? input.preserveMetadata
      : DEFAULT_SETTINGS.preserveMetadata,
    uiAnimation: isAnimationMode(input.uiAnimation)
      ? input.uiAnimation
      : DEFAULT_SETTINGS.uiAnimation,
    processingAnimation: isBoolean(input.processingAnimation)
      ? input.processingAnimation
      : DEFAULT_SETTINGS.processingAnimation,
    reduceMotion: isBoolean(input.reduceMotion)
      ? input.reduceMotion
      : DEFAULT_SETTINGS.reduceMotion,
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_SETTINGS }
    }
    return parseSettings(JSON.parse(raw) as unknown)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function persistSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function settingsEqual(a: AppSettings, b: AppSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
