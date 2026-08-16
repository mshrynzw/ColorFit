import { useCallback, useEffect, useRef, useState } from 'react'

import { AnimationSettings } from '../features/settings/AnimationSettings'
import { AppearanceSettings } from '../features/settings/AppearanceSettings'
import { BasicSettings } from '../features/settings/BasicSettings'
import { ExportSettings } from '../features/settings/ExportSettings'
import { ProcessingSettings } from '../features/settings/ProcessingSettings'
import { ResetDialog } from '../features/settings/ResetDialog'
import { SettingsNav } from '../features/settings/SettingsNav'
import { SettingsSaveButton } from '../features/settings/SettingsSaveButton'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  usePrefersReducedMotion,
  useReducedMotion,
} from '../hooks/useReducedMotion'
import { useSettings } from '../hooks/useSettings'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'
import { SETTINGS_CATEGORIES } from '../lib/constants/settings'
import { loadGsap } from '../lib/gsap'
import type { SettingsCategory } from '../types/settings'

export function SettingsPage() {
  usePageTitle(PAGE_TITLES[ROUTES.settings])
  const {
    draft,
    isDirty,
    updateDraft,
    resetDraft,
    saveStatus,
  } = useSettings()
  const osReducedMotion = usePrefersReducedMotion()
  const reducedMotion = useReducedMotion()
  const [category, setCategory] = useState<SettingsCategory>('basic')
  const [resetOpen, setResetOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reducedMotion || !rootRef.current) {
      return
    }
    let cancelled = false
    let context: { revert: () => void } | undefined
    void loadGsap().then(({ gsap }) => {
      if (cancelled || !rootRef.current) {
        return
      }
      context = gsap.context(() => {
        gsap.from('[data-anim="settings-in"]', {
          opacity: 0,
          y: 16,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
        })
      }, rootRef)
    })
    return () => {
      cancelled = true
      context?.revert()
    }
  }, [reducedMotion])

  const closeReset = useCallback(() => {
    setResetOpen(false)
  }, [])

  const confirmReset = useCallback(() => {
    resetDraft()
    setResetOpen(false)
  }, [resetDraft])

  const statusMessage =
    saveStatus === 'saved'
      ? '設定を保存しました'
      : isDirty
        ? '未保存の変更があります'
        : ''

  return (
    <main
      ref={rootRef}
      id="main"
      className="settings-main relative z-10"
    >
      <div className="settings-layout">
        <SettingsNav category={category} onChange={setCategory} />
        <div className="settings-content">
          <header className="settings-content-head" data-anim="settings-in">
            <h1 className="settings-title">設定</h1>
            <p className="settings-desc">
              ColorFitの動作や表示をカスタマイズできます。
            </p>
          </header>

          {SETTINGS_CATEGORIES.map((item) => (
            <section
              key={item.id}
              className="settings-panel"
              id={`panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${item.id}`}
              hidden={category !== item.id}
              data-anim="settings-in"
            >
              {item.id === 'basic' ? (
                <BasicSettings
                  defaultFormat={draft.defaultFormat}
                  defaultQuality={draft.defaultQuality}
                  onFormatChange={(defaultFormat) => {
                    updateDraft({ defaultFormat })
                  }}
                  onQualityChange={(defaultQuality) => {
                    updateDraft({ defaultQuality })
                  }}
                />
              ) : null}
              {item.id === 'appearance' ? (
                <AppearanceSettings
                  theme={draft.theme}
                  onThemeChange={(theme) => {
                    updateDraft({ theme })
                  }}
                />
              ) : null}
              {item.id === 'processing' ? (
                <ProcessingSettings
                  autoAdjust={draft.autoAdjust}
                  adjustmentStrength={draft.adjustmentStrength}
                  naturalColorPriority={draft.naturalColorPriority}
                  onAutoAdjustChange={(autoAdjust) => {
                    updateDraft({ autoAdjust })
                  }}
                  onStrengthChange={(adjustmentStrength) => {
                    updateDraft({ adjustmentStrength })
                  }}
                  onNaturalChange={(naturalColorPriority) => {
                    updateDraft({ naturalColorPriority })
                  }}
                />
              ) : null}
              {item.id === 'export' ? (
                <ExportSettings
                  defaultFormat={draft.defaultFormat}
                  defaultQuality={draft.defaultQuality}
                  filenameMode={draft.filenameMode}
                  preserveMetadata={draft.preserveMetadata}
                  onFilenameModeChange={(filenameMode) => {
                    updateDraft({ filenameMode })
                  }}
                  onPreserveMetadataChange={(preserveMetadata) => {
                    updateDraft({ preserveMetadata })
                  }}
                  onGoToBasic={() => {
                    setCategory('basic')
                  }}
                />
              ) : null}
              {item.id === 'animation' ? (
                <AnimationSettings
                  uiAnimation={draft.uiAnimation}
                  processingAnimation={draft.processingAnimation}
                  reduceMotion={draft.reduceMotion}
                  osReducedMotion={osReducedMotion}
                  onUiAnimationChange={(uiAnimation) => {
                    updateDraft({ uiAnimation })
                  }}
                  onProcessingAnimationChange={(processingAnimation) => {
                    updateDraft({ processingAnimation })
                  }}
                  onReduceMotionChange={(reduceMotion) => {
                    updateDraft({ reduceMotion })
                  }}
                />
              ) : null}
            </section>
          ))}

          <footer className="settings-footer" data-anim="settings-in">
            <div className="settings-footer__row">
              {isDirty ? (
                <span className="unsaved-badge">未保存の変更</span>
              ) : null}
              <SettingsSaveButton />
            </div>
            <button
              type="button"
              className="text-danger-btn"
              onClick={() => {
                setResetOpen(true)
              }}
            >
              設定を初期状態に戻す
            </button>
          </footer>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>
      <ResetDialog
        open={resetOpen}
        onCancel={closeReset}
        onConfirm={confirmReset}
      />
    </main>
  )
}
