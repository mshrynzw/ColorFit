import { describe, expect, it } from 'vitest'

import { MAX_UPLOAD_SIZE } from '../src/lib/constants/upload'
import { validateImageFileBasic } from '../src/lib/validation/imageFile'

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
