export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const MAX_IMAGE_WIDTH = 8192
export const MAX_IMAGE_HEIGHT = 8192
export const MAX_PIXEL_COUNT = 20_000_000

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

export const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp'
