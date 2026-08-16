import type { ImageInfo } from '../types/image'
import { apiFetch } from './client'

type ImageResponse = {
  image: ImageInfo
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
