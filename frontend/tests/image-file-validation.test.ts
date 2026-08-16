import { describe, expect, it, vi } from 'vitest'

import { MAX_UPLOAD_SIZE } from '../src/lib/constants/upload'
import { validateImageFile, validateImageFileBasic } from '../src/lib/validation/imageFile'

function createFile(name: string, type: string, size = 16) {
  const file = new File(['x'.repeat(Math.max(size, 1))], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('validateImageFileBasic', () => {
  it('accepts jpeg, png, and webp', () => {
    expect(validateImageFileBasic(createFile('a.jpg', 'image/jpeg')).ok).toBe(true)
    expect(validateImageFileBasic(createFile('a.png', 'image/png')).ok).toBe(true)
    expect(validateImageFileBasic(createFile('a.webp', 'image/webp')).ok).toBe(true)
  })

  it('rejects an empty file', () => {
    const result = validateImageFileBasic(createFile('a.png', 'image/png', 0))
    expect(result).toEqual({
      ok: false,
      message: '画像ファイルを指定してください。',
    })
  })

  it('rejects an oversized file', () => {
    const result = validateImageFileBasic(
      createFile('a.png', 'image/png', MAX_UPLOAD_SIZE + 1),
    )
    expect(result).toEqual({
      ok: false,
      message: '画像サイズが大きすぎます。',
    })
  })

  it('rejects an unsupported type', () => {
    const result = validateImageFileBasic(createFile('a.gif', 'image/gif'))
    expect(result).toEqual({
      ok: false,
      message: '対応していない画像形式です。',
    })
  })
})

describe('validateImageFile', () => {
  it('rejects dimensions that are too large', async () => {
    vi.stubGlobal('createImageBitmap', async () => ({
      width: 9000,
      height: 100,
      close: () => {},
    }))
    const result = await validateImageFile(createFile('wide.png', 'image/png'))
    expect(result).toEqual({
      ok: false,
      message: '画像の幅または高さが大きすぎます。',
    })
  })

  it('rejects a file that cannot be decoded', async () => {
    vi.stubGlobal('createImageBitmap', async () => {
      throw new Error('decode failed')
    })
    const result = await validateImageFile(createFile('broken.png', 'image/png'))
    expect(result).toEqual({
      ok: false,
      message: '画像を読み込めませんでした。',
    })
  })
})
