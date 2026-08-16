import { useEffect } from 'react'

import { Button } from '../../components/ui/Button'

type ResetDialogProps = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetDialog({ open, onCancel, onConfirm }: ResetDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div
      className="settings-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div
        className="settings-modal glass-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-desc"
      >
        <h2 className="settings-modal__title" id="reset-modal-title">
          設定を初期状態に戻しますか？
        </h2>
        <p className="settings-modal__desc" id="reset-modal-desc">
          現在の設定は失われます。
        </p>
        <div className="settings-modal__actions">
          <Button variant="ghost" onClick={onCancel}>
            キャンセル
          </Button>
          <Button className="settings-modal__confirm" autoFocus onClick={onConfirm}>
            初期状態に戻す
          </Button>
        </div>
      </div>
    </div>
  )
}
