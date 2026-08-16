import { useCallback, useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../api/client'
import { deleteImage, uploadImage } from '../api/images'
import { validateImageFile } from '../lib/validation/imageFile'
import type { ImageInfo, UploadStatus } from '../types/image'

export function useImageUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [image, setImage] = useState<ImageInfo | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const imageRef = useRef<ImageInfo | null>(null)

  const revokePreview = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url)
    }
  }, [])

  useEffect(() => {
    return () => {
      revokePreview(previewUrlRef.current)
    }
  }, [revokePreview])

  const selectFile = useCallback(
    async (file: File) => {
      setErrorMessage(null)
      const validation = await validateImageFile(file)
      if (!validation.ok) {
        setErrorMessage(validation.message)
        setStatus(imageRef.current ? 'success' : 'error')
        return
      }

      const previousUrl = previewUrlRef.current
      const previousImage = imageRef.current
      const pendingUrl = URL.createObjectURL(file)
      setPreviewUrl(pendingUrl)
      setStatus('uploading')

      try {
        const uploaded = await uploadImage(file)
        revokePreview(previousUrl)
        previewUrlRef.current = pendingUrl
        imageRef.current = uploaded
        setImage(uploaded)
        setStatus('success')
        if (previousImage) {
          void deleteImage(previousImage.id).catch(() => {
            // Local preview already switched. Do not block the editor.
          })
        }
      } catch (error) {
        revokePreview(pendingUrl)
        previewUrlRef.current = previousUrl
        setPreviewUrl(previousUrl)
        setImage(previousImage)
        setErrorMessage(getErrorMessage(error))
        setStatus(previousImage ? 'success' : 'error')
      }
    },
    [revokePreview],
  )

  const clearImage = useCallback(async () => {
    const currentId = imageRef.current?.id
    imageRef.current = null
    revokePreview(previewUrlRef.current)
    previewUrlRef.current = null
    setPreviewUrl(null)
    setImage(null)
    setErrorMessage(null)
    setStatus('idle')
    if (currentId) {
      try {
        await deleteImage(currentId)
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        setStatus('error')
      }
    }
  }, [revokePreview])

  return {
    status,
    image,
    previewUrl,
    errorMessage,
    selectFile,
    clearImage,
  }
}
