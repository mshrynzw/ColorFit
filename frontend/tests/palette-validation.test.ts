import { describe, expect, it } from 'vitest'

import { DEFAULT_PALETTE } from '../src/lib/constants/palette'
import type { PaletteColor } from '../src/types/palette'
import {
  isValidHexColor,
  redistributeRatios,
  validatePalette,
} from '../src/lib/validation/palette'

function palette(): PaletteColor[] {
  return DEFAULT_PALETTE.map((item) => ({ ...item }))
}

describe('palette validation', () => {
  it('accepts the default palette', () => {
    expect(validatePalette(palette(), 0.7)).toEqual({ ok: true })
    expect(isValidHexColor('#1E3A5F')).toBe(true)
    expect(isValidHexColor('1E3A5F')).toBe(false)
  })

  it('rejects an invalid hex color', () => {
    const colors = palette()
    colors[0] = { ...colors[0], color: '#GGGGGG' }
    expect(validatePalette(colors, 0.7)).toEqual({
      ok: false,
      message: 'カラーコードが正しくありません。',
    })
  })

  it('rejects a palette that is not three colors', () => {
    expect(validatePalette(palette().slice(0, 2), 0.7)).toEqual({
      ok: false,
      message: 'カラーパレットが正しくありません。',
    })
  })

  it('rejects a strength outside 0 to 1', () => {
    expect(validatePalette(palette(), 1.2)).toEqual({
      ok: false,
      message: '色の適用強度が正しくありません。',
    })
  })

  it('rejects ratios that do not total 100', () => {
    const colors = palette()
    colors[0] = { ...colors[0], ratio: 90 }
    expect(validatePalette(colors, 0.7)).toEqual({
      ok: false,
      message: '配色割合が正しくありません。',
    })
  })

  it('keeps ratio total at 100 when a slider changes', () => {
    const next = redistributeRatios(palette(), 0, 80)
    const total = next.reduce((sum, item) => sum + item.ratio, 0)
    expect(next[0].ratio).toBe(80)
    expect(total).toBe(100)
  })
})
