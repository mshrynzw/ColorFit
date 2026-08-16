import { describe, expect, it } from 'vitest'

import { formatFileSize, formatImageType } from '../src/lib/format/fileSize'

describe('formatFileSize', () => {
  it('formats bytes, kilobytes, and megabytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(2_400_000)).toBe('2.29 MB')
  })
})

describe('formatImageType', () => {
  it('maps mime types to short labels', () => {
    expect(formatImageType('image/jpeg')).toBe('JPG')
    expect(formatImageType('image/png')).toBe('PNG')
    expect(formatImageType('image/webp')).toBe('WebP')
  })
})
