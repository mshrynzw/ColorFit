import type { ImageInfo } from '../types/image'
import type { AdjustmentPayload } from '../types/palette'
import type { ProcessResult } from '../types/processing'
import type { ExportFormat, ExportQuality } from '../types/settings'
import { apiFetch } from './client'

type ImageResponse = {
  image: ImageInfo
}

type ProcessResponse = {
  result: ProcessResult
}

export async function uploadImage(file: File): Promise<ImageInfo> {
  const body = new FormData()
  body.append('file', file)
  const response = await apiFetch('/api/images', {
    method: 'POST',
    body,
  })
  const payload = (await response.json()) as ImageResponse
  return payload.image
}

export async function getImage(imageId: string): Promise<ImageInfo> {
  const response = await apiFetch(`/api/images/${imageId}`)
  const payload = (await response.json()) as ImageResponse
  return payload.image
}

export async function deleteImage(imageId: string): Promise<void> {
  await apiFetch(`/api/images/${imageId}`, {
    method: 'DELETE',
  })
}

export async function processImage(
  imageId: string,
  adjustment: AdjustmentPayload,
): Promise<ProcessResult> {
  const response = await apiFetch(`/api/images/${imageId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  })
  const payload = (await response.json()) as ProcessResponse
  return payload.result
}

export async function getResult(imageId: string): Promise<ProcessResult> {
  const response = await apiFetch(`/api/images/${imageId}/result`)
  const payload = (await response.json()) as ProcessResponse
  return payload.result
}

export type DownloadSource = 'original' | 'processed'

export type DownloadOptions = {
  source?: DownloadSource
  format?: ExportFormat
  quality?: ExportQuality
}

export async function downloadImage(
  imageId: string,
  sourceOrOptions?: DownloadSource | DownloadOptions,
): Promise<Blob> {
  const options: DownloadOptions =
    typeof sourceOrOptions === 'string'
      ? { source: sourceOrOptions }
      : (sourceOrOptions ?? {})
  const params = new URLSearchParams()
  if (options.source) {
    params.set('source', options.source)
  }
  if (options.format) {
    params.set('format', options.format)
  }
  if (options.quality) {
    params.set('quality', options.quality)
  }
  const query = params.toString()
  const response = await apiFetch(
    `/api/images/${imageId}/download${query ? `?${query}` : ''}`,
  )
  return response.blob()
}
