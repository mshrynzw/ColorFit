import type { AdjustmentPayload } from './palette'

export type ProcessResult = {
  imageId: string
  status: string
  resultUrl: string
  originalUrl?: string | null
  palette?: AdjustmentPayload['palette'] | null
  strength?: number | null
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error'
