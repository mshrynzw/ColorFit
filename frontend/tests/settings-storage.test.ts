import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../src/lib/constants/settings'
import { loadSettings, parseSettings, persistSettings } from '../src/lib/settings/storage'

describe('settings storage', () => {
  it('falls back to defaults for invalid payloads', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings({ theme: 'neon', adjustmentStrength: 400 })).toEqual(
      DEFAULT_SETTINGS,
    )
  })

  it('keeps valid stored values', () => {
    const parsed = parseSettings({
      ...DEFAULT_SETTINGS,
      theme: 'light',
      filenameMode: 'colorfit',
      adjustmentStrength: 40,
    })
    expect(parsed.theme).toBe('light')
    expect(parsed.filenameMode).toBe('colorfit')
    expect(parsed.adjustmentStrength).toBe(40)
  })

  it('round-trips settings through localStorage', () => {
    persistSettings({ ...DEFAULT_SETTINGS, uiAnimation: 'off' })
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toContain('"uiAnimation":"off"')
    expect(loadSettings().uiAnimation).toBe('off')
  })
})
