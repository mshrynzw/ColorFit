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

  it('keeps ratio total at 100 when a slider changes', () => {
    const next = redistributeRatios(palette(), 0, 80)
    const total = next.reduce((sum, item) => sum + item.ratio, 0)
    expect(next[0].ratio).toBe(80)
    expect(total).toBe(100)
  })
})
