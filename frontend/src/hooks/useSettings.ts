import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { DEFAULT_SETTINGS } from '../lib/constants/settings'
import {
  loadSettings,
  persistSettings,
  settingsEqual,
} from '../lib/settings/storage'
import type { AppSettings } from '../types/settings'

type SaveStatus = 'idle' | 'saving' | 'saved'

type SettingsContextValue = {
  settings: AppSettings
  draft: AppSettings
  isDirty: boolean
  saveStatus: SaveStatus
  updateDraft: (patch: Partial<AppSettings>) => void
  save: () => void
  resetDraft: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function syncDocumentMotion(settings: AppSettings) {
  const osReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const reduced =
    osReduced || settings.reduceMotion || settings.uiAnimation === 'off'
  document.documentElement.dataset.reduceMotion = reduced ? 'true' : 'false'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<AppSettings>(() => loadSettings())
  const [draft, setDraft] = useState<AppSettings>(saved)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const savedTimer = useRef<number>(0)

  useEffect(() => {
    syncDocumentMotion(saved)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      syncDocumentMotion(saved)
    }
    mediaQuery.addEventListener('change', update)
    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [saved])

  useEffect(() => {
    return () => {
      window.clearTimeout(savedTimer.current)
    }
  }, [])

  const updateDraft = useCallback((patch: Partial<AppSettings>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setSaveStatus('idle')
  }, [])

  const save = useCallback(() => {
    persistSettings(draft)
    setSaved(draft)
    setSaveStatus('saved')
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => {
      setSaveStatus('idle')
    }, 1800)
  }, [draft])

  const resetDraft = useCallback(() => {
    setDraft({ ...DEFAULT_SETTINGS })
    setSaveStatus('idle')
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings: saved,
      draft,
      isDirty: !settingsEqual(saved, draft),
      saveStatus,
      updateDraft,
      save,
      resetDraft,
    }),
    [saved, draft, saveStatus, updateDraft, save, resetDraft],
  )

  return createElement(SettingsContext.Provider, { value }, children)
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
