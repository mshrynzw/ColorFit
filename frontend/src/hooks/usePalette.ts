import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_PALETTE, DEFAULT_STRENGTH } from '../lib/constants/palette'
import {
  isValidHexColor,
  redistributeRatios,
  toAdjustmentPayload,
  validatePalette,
} from '../lib/validation/palette'
import type { AdjustmentPayload, PaletteColor } from '../types/palette'

export function usePalette() {
  const [colors, setColors] = useState<PaletteColor[]>(() =>
    DEFAULT_PALETTE.map((item) => ({ ...item })),
  )
  const [strength, setStrengthState] = useState(DEFAULT_STRENGTH)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const validation = useMemo(() => {
    const invalidDraft = Object.values(drafts).some(
      (value) => value.length >= 7 && !isValidHexColor(value),
    )
    if (invalidDraft) {
      return { ok: false as const, message: 'カラーコードが正しくありません。' }
    }
    return validatePalette(colors, strength)
  }, [colors, drafts, strength])

  const setColor = useCallback((id: string, color: string) => {
    const next = color.startsWith('#') ? color : `#${color}`
    setDrafts((current) => ({ ...current, [id]: next }))
    if (!isValidHexColor(next)) {
      return
    }
    setColors((current) =>
      current.map((item) =>
        item.id === id ? { ...item, color: next.toUpperCase() } : item,
      ),
    )
  }, [])

  const setRatio = useCallback((id: string, ratio: number) => {
    setColors((current) => {
      const index = current.findIndex((item) => item.id === id)
      if (index < 0) {
        return current
      }
      return redistributeRatios(current, index, ratio)
    })
  }, [])

  const setStrength = useCallback((value: number) => {
    setStrengthState(Math.max(0, Math.min(1, value)))
  }, [])

  const hexValue = useCallback(
    (item: PaletteColor) => drafts[item.id] ?? item.color,
    [drafts],
  )

  const hydrate = useCallback((payload: AdjustmentPayload) => {
    setDrafts({})
    setStrengthState(Math.max(0, Math.min(1, payload.strength)))
    setColors((current) =>
      payload.palette.map((item) => {
        const existing = current.find((color) => color.name === item.name)
        return {
          id: existing?.id ?? item.name,
          name: item.name,
          label: existing?.label ?? item.name,
          color: item.color.toUpperCase(),
          ratio: item.ratio,
        }
      }),
    )
  }, [])

  return {
    colors,
    strength,
    validation,
    payload: toAdjustmentPayload(colors, strength),
    hexValue,
    setColor,
    setRatio,
    setStrength,
    hydrate,
  }
}
