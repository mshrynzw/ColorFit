import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MAX_PIXEL_COUNT,
  MAX_UPLOAD_SIZE,
} from '../constants/upload'

export type ImageFileValidationResult =
  | { ok: true }
  | { ok: false; message: string }

function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

function normalizeMimeType(mimeType: string): string {
  const mime = mimeType.split(';', 1)[0]?.trim().toLowerCase() ?? ''
  return mime === 'image/jpg' ? 'image/jpeg' : mime
}

export function validateImageFileBasic(file: File): ImageFileValidationResult {
  if (file.size <= 0) {
    return { ok: false, message: '画像ファイルを指定してください。' }
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return { ok: false, message: '画像サイズが大きすぎます。' }
  }

  const mime = normalizeMimeType(file.type)
  const mimeOk = mime
    ? ACCEPTED_MIME_TYPES.includes(mime as (typeof ACCEPTED_MIME_TYPES)[number])
    : hasAcceptedExtension(file.name)

  if (!mimeOk) {
    return { ok: false, message: '対応していない画像形式です。' }
  }

  if (mime && !hasAcceptedExtension(file.name) && file.name.includes('.')) {
    return { ok: false, message: '対応していない画像形式です。' }
  }

  return { ok: true }
}

export async function validateImageFile(
  file: File,
): Promise<ImageFileValidationResult> {
  const basic = validateImageFileBasic(file)
  if (!basic.ok) {
    return basic
  }

  if (typeof createImageBitmap !== 'function') {
    return { ok: true }
  }

  try {
    const bitmap = await createImageBitmap(file)
    const width = bitmap.width
    const height = bitmap.height
    bitmap.close()

    if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
      return { ok: false, message: '画像の幅または高さが大きすぎます。' }
    }
    if (width * height > MAX_PIXEL_COUNT) {
      return { ok: false, message: '画像の幅または高さが大きすぎます。' }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: '画像を読み込めませんでした。' }
  }
}
