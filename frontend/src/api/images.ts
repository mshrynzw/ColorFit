import type { ImageInfo } from '../types/image'
import type { AdjustmentPayload } from '../types/palette'
import type { ProcessResult } from '../types/processing'
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

export async function downloadImage(imageId: string): Promise<Blob> {
  const response = await apiFetch(`/api/images/${imageId}/download`)
  return response.blob()
}
