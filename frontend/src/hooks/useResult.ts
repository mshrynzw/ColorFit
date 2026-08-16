import { useEffect, useState } from 'react'

import { getErrorMessage } from '../api/client'
import { downloadImage, getImage, getResult } from '../api/images'
import type { ImageInfo } from '../types/image'
import type { AdjustmentPayload } from '../types/palette'

type ResultState = {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty'
  image: ImageInfo | null
  originalUrl: string | null
  processedUrl: string | null
  palette: AdjustmentPayload['palette']
  strength: number | null
  errorMessage: string | null
}

const EMPTY: ResultState = {
  status: 'empty',
  image: null,
  originalUrl: null,
  processedUrl: null,
  palette: [],
  strength: null,
  errorMessage: null,
}

export function useResult(imageId: string | null) {
  const [state, setState] = useState<ResultState>(
    imageId ? { ...EMPTY, status: 'loading' } : EMPTY,
  )

  useEffect(() => {
    if (!imageId) {
      setState(EMPTY)
      return
    }

    let cancelled = false
    const originalObjectUrl = { current: null as string | null }
    const processedObjectUrl = { current: null as string | null }

    setState((current) => ({ ...current, status: 'loading', errorMessage: null }))

    void (async () => {
      try {
        const [image, result, originalBlob, processedBlob] = await Promise.all([
          getImage(imageId),
          getResult(imageId),
          downloadImage(imageId, 'original'),
          downloadImage(imageId),
        ])
        if (cancelled) {
          return
        }
        originalObjectUrl.current = URL.createObjectURL(originalBlob)
        processedObjectUrl.current = URL.createObjectURL(processedBlob)
        setState({
          status: 'success',
          image,
          originalUrl: originalObjectUrl.current,
          processedUrl: processedObjectUrl.current,
          palette: result.palette ?? [],
          strength: result.strength ?? null,
          errorMessage: null,
        })
      } catch (error) {
        if (cancelled) {
          return
        }
        setState({
          ...EMPTY,
          status: 'error',
          errorMessage: getErrorMessage(error),
        })
      }
    })()

    return () => {
      cancelled = true
      if (originalObjectUrl.current) {
        URL.revokeObjectURL(originalObjectUrl.current)
      }
      if (processedObjectUrl.current) {
        URL.revokeObjectURL(processedObjectUrl.current)
      }
    }
  }, [imageId])

  return state
}
