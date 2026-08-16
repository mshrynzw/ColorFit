import { HEX_COLOR_PATTERN, RATIO_SUM } from '../constants/palette'
import type { PaletteColor } from '../../types/palette'

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value)
}

export function ratioTotal(colors: PaletteColor[]): number {
  return colors.reduce((sum, item) => sum + item.ratio, 0)
}

export function redistributeRatios(
  colors: PaletteColor[],
  changedIndex: number,
  nextValue: number,
): PaletteColor[] {
  const clamped = Math.max(0, Math.min(100, Math.round(nextValue)))
  const values = colors.map((item) => item.ratio)
  values[changedIndex] = clamped

  const others = colors.map((_, index) => index).filter((index) => index !== changedIndex)
  const othersTotal = others.reduce((sum, index) => sum + values[index], 0)
  const remaining = RATIO_SUM - clamped

  if (othersTotal <= 0) {
    const share = Math.round(remaining / others.length)
    others.forEach((index) => {
      values[index] = share
    })
  } else {
    others.forEach((index) => {
      values[index] = Math.round((values[index] / othersTotal) * remaining)
    })
  }

  const drift =
    RATIO_SUM - values.reduce((sum, value) => sum + value, 0)
  values[others[others.length - 1]] += drift

  return colors.map((item, index) => ({
    ...item,
    ratio: Math.max(0, Math.min(100, values[index])),
  }))
}

export function validatePalette(
  colors: PaletteColor[],
  strength: number,
): { ok: true } | { ok: false; message: string } {
  if (colors.length !== 3) {
    return { ok: false, message: 'カラーパレットが正しくありません。' }
  }
  if (colors.some((item) => !isValidHexColor(item.color))) {
    return { ok: false, message: 'カラーコードが正しくありません。' }
  }
  if (colors.some((item) => item.ratio < 0 || item.ratio > 100)) {
    return { ok: false, message: '配色割合が正しくありません。' }
  }
  if (ratioTotal(colors) !== RATIO_SUM) {
    return { ok: false, message: '配色割合が正しくありません。' }
  }
  if (strength < 0 || strength > 1) {
    return { ok: false, message: '色の適用強度が正しくありません。' }
  }
  return { ok: true }
}

export function toAdjustmentPayload(
  colors: PaletteColor[],
  strength: number,
) {
  return {
    palette: colors.map((item) => ({
      name: item.name,
      color: item.color.toUpperCase(),
      ratio: item.ratio,
    })),
    strength,
  }
}
