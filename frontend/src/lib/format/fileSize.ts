export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kilobytes = bytes / 1024
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`
  }

  const megabytes = kilobytes / 1024
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`
}

export function formatImageType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPG'
    case 'image/png':
      return 'PNG'
    case 'image/webp':
      return 'WebP'
    default:
      return mimeType
  }
}
