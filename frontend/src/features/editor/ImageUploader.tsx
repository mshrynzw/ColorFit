import { useId, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/Button'
import { getButtonClassName } from '../../components/ui/button-styles'
import { useSettings } from '../../hooks/useSettings'
import { cn } from '../../lib/cn'
import { ACCEPT_ATTRIBUTE } from '../../lib/constants/upload'
import type { UploadStatus } from '../../types/image'
import { ProcessingOverlay } from './ProcessingOverlay'

type ImageUploaderProps = {
  status: UploadStatus
  errorMessage: string | null
  hasImage: boolean
  overlayMessage?: string | null
  onSelectFile: (file: File) => void
  onRemove?: () => void
  children?: ReactNode
}

export function ImageUploader({
  status,
  errorMessage,
  hasImage,
  overlayMessage = null,
  onSelectFile,
  onRemove,
  children,
}: ImageUploaderProps) {
  const { settings } = useSettings()
  const inputId = useId()
  const errorId = useId()
  const statusId = useId()
  const dragCount = useRef(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const uploading = status === 'uploading'
  const busy = uploading || Boolean(overlayMessage)
  const showEmpty = !hasImage && !busy

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) {
      onSelectFile(file)
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragCount.current += 1
    setIsDragOver(true)
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragCount.current -= 1
    if (dragCount.current <= 0) {
      dragCount.current = 0
      setIsDragOver(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragCount.current = 0
    setIsDragOver(false)
    if (!busy) {
      handleFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section
        className={cn(
          'glass-panel relative flex min-h-[420px] flex-col p-1 transition duration-300',
          isDragOver &&
            'border-primary/55 shadow-[0_0_0_4px_rgba(94,234,212,0.1),0_30px_80px_-30px_rgba(0,0,0,0.7)]',
        )}
        aria-label="画像のアップロード領域"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {showEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
            <UploadIcon />
            <p className="text-base font-semibold text-text">画像をここにドロップ</p>
            <p className="text-[12.5px] text-text-subtle">または</p>
            <label
              htmlFor={inputId}
              className={getButtonClassName({
                variant: 'ghost',
                size: 'small',
                className: 'mt-1 cursor-pointer',
              })}
            >
              画像を選択
            </label>
            <p className="mt-2.5 text-xs text-text-subtle">対応形式：JPG / PNG / WebP</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3.5 p-3 md:p-4">
            {children}
            <div className="flex flex-wrap justify-center gap-2.5">
              <label
                htmlFor={inputId}
                className={getButtonClassName({
                  variant: 'ghost',
                  size: 'small',
                  className: cn('cursor-pointer', busy && 'pointer-events-none opacity-50'),
                })}
              >
                画像を変更
              </label>
              {onRemove ? (
                <Button
                  variant="ghost"
                  size="small"
                  disabled={busy}
                  onClick={() => {
                    void onRemove()
                  }}
                >
                  画像を削除
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {uploading ? (
          <ProcessingOverlay variant="upload" message="アップロードしています…" />
        ) : overlayMessage ? (
          <ProcessingOverlay
            variant="process"
            message={overlayMessage}
            animated={settings.processingAnimation}
          />
        ) : null}

        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={ACCEPT_ATTRIBUTE}
          aria-label="画像ファイルを選択"
          aria-describedby={errorMessage ? errorId : undefined}
          disabled={busy}
          onChange={handleChange}
        />
      </section>

      <p id={statusId} className="sr-only" role="status" aria-live="polite">
        {busy ? overlayMessage ?? 'アップロードしています' : hasImage ? '画像をアップロードしました' : ''}
      </p>

      {errorMessage ? (
        <p id={errorId} role="alert" className="text-sm text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="mb-1.5 h-[46px] w-[46px] text-text-subtle"
    >
      <rect
        x="6"
        y="10"
        width="36"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="17" cy="20" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 32l9-9 6 6 5-5 8 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
