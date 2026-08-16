import { useState } from 'react'

import { getErrorMessage } from '../../api/client'
import { downloadImage } from '../../api/images'
import { Button } from '../../components/ui/Button'
import { useSettings } from '../../hooks/useSettings'
import { cn } from '../../lib/cn'
import { processedDownloadName } from '../../lib/format/filename'

type DownloadButtonProps = {
  imageId: string
  filename?: string
}

export function DownloadButton({ imageId, filename }: DownloadButtonProps) {
  const { settings } = useSettings()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleDownload() {
    setErrorMessage(null)
    setStatus('loading')
    try {
      const blob = await downloadImage(imageId, {
        format: settings.defaultFormat,
        quality: settings.defaultQuality,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = processedDownloadName(
        filename,
        settings.filenameMode,
        settings.defaultFormat,
      )
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus('success')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        size="large"
        className="w-full"
        disabled={status === 'loading'}
        aria-busy={status === 'loading'}
        onClick={() => {
          void handleDownload()
        }}
      >
        {status === 'loading' ? '書き出しています…' : '画像を書き出す'}
      </Button>
      <p
        role={status === 'error' ? 'alert' : 'status'}
        className={cn(
          'text-center text-[12.5px]',
          status === 'error' ? 'text-error' : 'text-text-subtle',
        )}
      >
        {status === 'error'
          ? errorMessage
          : status === 'success'
            ? '画像を書き出しました。'
            : ''}
      </p>
    </div>
  )
}
