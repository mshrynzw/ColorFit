export type ProcessResult = {
  imageId: string
  status: string
  resultUrl: string
  originalUrl?: string | null
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error'
