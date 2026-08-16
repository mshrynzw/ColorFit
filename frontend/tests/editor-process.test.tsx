import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ColorFitApiError } from '../src/api/client'
import { deleteImage, downloadImage, processImage, uploadImage } from '../src/api/images'
import { appRoutes } from '../src/app/router'

vi.mock('../src/api/images', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  processImage: vi.fn(),
  downloadImage: vi.fn(),
}))

const uploadImageMock = vi.mocked(uploadImage)
const deleteImageMock = vi.mocked(deleteImage)
const processImageMock = vi.mocked(processImage)
const downloadImageMock = vi.mocked(downloadImage)

function renderEditor() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/editor'],
  })
  return render(<RouterProvider router={router} />)
}

function pngFile(name = 'sample.png') {
  return new File(['png-bytes'], name, { type: 'image/png' })
}

describe('editor image processing', () => {
  beforeEach(() => {
    vi.stubGlobal('createImageBitmap', async () => ({
      width: 32,
      height: 24,
      close: () => {},
    }))
    uploadImageMock.mockReset()
    deleteImageMock.mockReset()
    processImageMock.mockReset()
    downloadImageMock.mockReset()
    uploadImageMock.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      filename: 'sample.png',
      mimeType: 'image/png',
      fileSize: 9,
      width: 32,
      height: 24,
      status: 'uploaded',
    })
    deleteImageMock.mockResolvedValue()
    processImageMock.mockResolvedValue({
      imageId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      resultUrl: '/api/images/550e8400-e29b-41d4-a716-446655440000/result',
    })
    downloadImageMock.mockResolvedValue(new Blob(['webp-bytes'], { type: 'image/webp' }))
  })

  it('keeps the process button disabled until an image is uploaded', () => {
    renderEditor()

    expect(screen.getByRole('button', { name: 'ColorFitで調整する' })).toBeDisabled()
  })

  it('processes an uploaded image and updates the preview', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))

    expect(await screen.findByAltText('sample.pngの調整後プレビュー')).toBeInTheDocument()
    expect(screen.getByText('調整後')).toBeInTheDocument()
    expect(processImageMock).toHaveBeenCalledTimes(1)
    expect(downloadImageMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    )
    expect(
      screen.getByText('調整が完了しました。プレビューに反映しています。'),
    ).toBeInTheDocument()
  })

  it('shows a processing overlay while the api is in flight', async () => {
    const user = userEvent.setup()
    let resolveProcess: (value: {
      imageId: string
      status: string
      resultUrl: string
    }) => void = () => {}
    processImageMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProcess = resolve
        }),
    )
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))

    expect(await screen.findByRole('button', { name: '処理中…' })).toBeDisabled()
    expect(screen.getAllByText('配色を解析しています…').length).toBeGreaterThan(0)

    resolveProcess({
      imageId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      resultUrl: '/api/images/550e8400-e29b-41d4-a716-446655440000/result',
    })

    expect(await screen.findByAltText('sample.pngの調整後プレビュー')).toBeInTheDocument()
  })

  it('shows a processing error without changing the original preview', async () => {
    const user = userEvent.setup()
    processImageMock.mockRejectedValue(
      new ColorFitApiError(
        'IMAGE_PROCESSING_FAILED',
        '画像の処理に失敗しました。',
        500,
      ),
    )
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '画像の処理に失敗しました。',
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'もう一度お試しください。',
    )
    expect(screen.getByAltText('sample.pngのプレビュー')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ColorFitで調整する' })).toBeEnabled()
    })
  })
})
