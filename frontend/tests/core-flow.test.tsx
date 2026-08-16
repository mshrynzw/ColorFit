import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const IMAGE_ID = '550e8400-e29b-41d4-a716-446655440000'

function renderApp(path = '/') {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })
  return render(<RouterProvider router={router} />)
}

function pngFile(name = 'sample.png') {
  return new File(['png-bytes'], name, { type: 'image/png' })
}

describe('core user flow', () => {
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
      id: IMAGE_ID,
      filename: 'sample.png',
      mimeType: 'image/png',
      fileSize: 9,
      width: 32,
      height: 24,
      status: 'uploaded',
    })
    deleteImageMock.mockResolvedValue()
    processImageMock.mockResolvedValue({
      imageId: IMAGE_ID,
      status: 'completed',
      resultUrl: `/api/images/${IMAGE_ID}/result`,
    })
    getImageMock.mockResolvedValue({
      id: IMAGE_ID,
      filename: 'sample.png',
      mimeType: 'image/png',
      fileSize: 9,
      width: 32,
      height: 24,
      status: 'completed',
    })
    getResultMock.mockResolvedValue({
      imageId: IMAGE_ID,
      status: 'completed',
      resultUrl: `/api/images/${IMAGE_ID}/download`,
      palette: [
        { name: 'primary', color: '#1E3A5F', ratio: 60 },
        { name: 'secondary', color: '#D8B26E', ratio: 30 },
        { name: 'accent', color: '#F5F1E8', ratio: 10 },
      ],
      strength: 0.7,
    })
    downloadImageMock.mockImplementation(async (_id, source) => {
      return new Blob([source === 'original' ? 'original' : 'processed'], {
        type: source === 'original' ? 'image/png' : 'image/webp',
      })
    })
  })

  it('runs upload, process, result, download, and return to editor', async () => {
    const user = userEvent.setup()
    const downloads: string[] = []
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download)
      })
    renderApp('/')

    await user.click(screen.getAllByRole('link', { name: 'はじめる' })[0])
    await user.upload(
      await screen.findByLabelText('画像ファイルを選択'),
      pngFile(),
    )
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))
    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()
    expect(screen.getByAltText('sample.pngの調整後')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '画像を書き出す' }))
    expect(await screen.findByText('画像を書き出しました。')).toBeInTheDocument()
    expect(downloads[0]).toBe('sample.webp')

    await user.click(screen.getByRole('link', { name: 'もう一度調整する' }))
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()
    expect(getImageMock).toHaveBeenCalledWith(IMAGE_ID)
    expect(downloadImageMock).toHaveBeenCalledWith(IMAGE_ID, 'original')

    click.mockRestore()
  })
})
