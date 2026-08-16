import { useCallback, useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../api/client'
import { downloadImage, processImage } from '../api/images'
import type { AdjustmentPayload } from '../types/palette'
import type { ProcessingStatus } from '../types/processing'

export function useImageProcessing() {
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const processedUrlRef = useRef<string | null>(null)

  const revokeProcessed = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url)
    }
  }, [])

  useEffect(() => {
    return () => {
      revokeProcessed(processedUrlRef.current)
    }
  }, [revokeProcessed])

  const reset = useCallback(() => {
    revokeProcessed(processedUrlRef.current)
    processedUrlRef.current = null
    setProcessedUrl(null)
    setErrorMessage(null)
    setStatus('idle')
  }, [revokeProcessed])

  const process = useCallback(
    async (imageId: string, adjustment: AdjustmentPayload) => {
      setErrorMessage(null)
      setStatus('processing')
      try {
        await processImage(imageId, adjustment)
        const blob = await downloadImage(imageId)
        const nextUrl = URL.createObjectURL(blob)
        revokeProcessed(processedUrlRef.current)
        processedUrlRef.current = nextUrl
        setProcessedUrl(nextUrl)
        setStatus('success')
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        setStatus('error')
      }
    },
    [revokeProcessed],
  )

  return {
    status,
    processedUrl,
    errorMessage,
    process,
    reset,
  }
}
