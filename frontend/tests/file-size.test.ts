import { describe, expect, it } from 'vitest'

import { processedDownloadName } from '../src/lib/format/filename'
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

describe('processedDownloadName', () => {
  it('keeps the original stem and uses a webp extension', () => {
    expect(processedDownloadName('sample.png')).toBe('sample.webp')
    expect(processedDownloadName('CHASE!.png')).toBe('CHASE!.webp')
    expect(processedDownloadName('archive.tar.png')).toBe('archive.tar.webp')
    expect(processedDownloadName('no-ext')).toBe('no-ext.webp')
    expect(processedDownloadName('')).toBe('image.webp')
  })
})
