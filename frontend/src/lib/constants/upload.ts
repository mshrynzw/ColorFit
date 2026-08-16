export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const MAX_IMAGE_WIDTH = 512
export const MAX_IMAGE_HEIGHT = 512
export const MAX_PIXEL_COUNT = MAX_IMAGE_WIDTH * MAX_IMAGE_HEIGHT

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

export const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp'
