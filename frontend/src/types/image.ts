export type ImageInfo = {
  id: string
  filename: string
  mimeType: string
  fileSize: number
  width: number
  height: number
  status?: string
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
