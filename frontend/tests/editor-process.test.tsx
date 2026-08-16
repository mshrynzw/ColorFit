import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ColorFitApiError } from '../src/api/client'
import {
  deleteImage,
  downloadImage,
  getImage,
  getResult,
  processImage,
  uploadImage,
} from '../src/api/images'
import { appRoutes } from '../src/app/router'

vi.mock('../src/api/images', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  processImage: vi.fn(),
  downloadImage: vi.fn(),
  getImage: vi.fn(),
  getResult: vi.fn(),
}))

const uploadImageMock = vi.mocked(uploadImage)
const deleteImageMock = vi.mocked(deleteImage)
const processImageMock = vi.mocked(processImage)
const downloadImageMock = vi.mocked(downloadImage)
const getImageMock = vi.mocked(getImage)
const getResultMock = vi.mocked(getResult)

async function renderEditor(path = '/editor') {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })
  const view = render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1, name: '画像を調整' })
  return view
}

async function renderEditorWithId() {
  return renderEditor('/editor?imageId=550e8400-e29b-41d4-a716-446655440000')
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
    getImageMock.mockReset()
    getResultMock.mockReset()
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
    getImageMock.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      filename: 'sample.png',
      mimeType: 'image/png',
      fileSize: 9,
      width: 32,
      height: 24,
      status: 'completed',
    })
    getResultMock.mockResolvedValue({
      imageId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'completed',
      resultUrl: '/api/images/550e8400-e29b-41d4-a716-446655440000/download',
      palette: [
        { name: 'primary', color: '#1E3A5F', ratio: 60 },
        { name: 'secondary', color: '#D8B26E', ratio: 30 },
        { name: 'accent', color: '#F5F1E8', ratio: 10 },
      ],
      strength: 0.7,
    })
  })

  it('keeps the process button disabled until an image is uploaded', async () => {
    await renderEditor()

    expect(screen.getByRole('button', { name: 'ColorFitで調整する' })).toBeDisabled()
  })

  it('processes an uploaded image and opens the result page', async () => {
    const user = userEvent.setup()
    await renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))

    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '画像を書き出す' })).toBeInTheDocument()
    expect(processImageMock).toHaveBeenCalledTimes(1)
    expect(getResultMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    )
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
    await renderEditor()

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

    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()
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
    await renderEditor()

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

  it('restores the original image from a result id', async () => {
    let resolveImage: (value: {
      id: string
      filename: string
      mimeType: string
      fileSize: number
      width: number
      height: number
      status: string
    }) => void = () => {}
    getImageMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveImage = resolve
        }),
    )
    await renderEditorWithId()

    expect(
      (await screen.findAllByText('画像を読み込んでいます…')).length,
    ).toBeGreaterThan(0)
    resolveImage({
      id: '550e8400-e29b-41d4-a716-446655440000',
      filename: 'sample.png',
      mimeType: 'image/png',
      fileSize: 9,
      width: 32,
      height: 24,
      status: 'completed',
    })
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()
    expect(downloadImageMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      'original',
    )
  })
})
