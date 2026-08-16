import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteImage,
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

function renderEditor() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/editor'],
  })
  return render(<RouterProvider router={router} />)
}

function pngFile() {
  return new File(['png-bytes'], 'sample.png', { type: 'image/png' })
}

describe('editor palette settings', () => {
  beforeEach(() => {
    vi.stubGlobal('createImageBitmap', async () => ({
      width: 32,
      height: 24,
      close: () => {},
    }))
    uploadImageMock.mockReset()
    deleteImageMock.mockReset()
    processImageMock.mockReset()
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
  })

  it('shows a validation error for an invalid hex color', () => {
    renderEditor()

    fireEvent.change(screen.getByLabelText('メインカラー HEXコード'), {
      target: { value: '#GGGGGG' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'カラーコードが正しくありません。',
    )
    expect(screen.getByRole('button', { name: 'ColorFitで調整する' })).toBeDisabled()
  })

  it('keeps the ratio total at 100 when a slider changes', () => {
    renderEditor()

    fireEvent.change(screen.getByLabelText('メイン', { exact: true }), {
      target: { value: '80' },
    })

    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText(/合計/)).toHaveTextContent('100%')
  })

  it('updates the strength slider', () => {
    renderEditor()

    fireEvent.change(screen.getByLabelText('適用強度'), { target: { value: '0.4' } })

    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('sends the edited palette and strength to process', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('メインカラー HEXコード'), {
      target: { value: '#FF0000' },
    })
    fireEvent.change(screen.getByLabelText('適用強度'), { target: { value: '0.4' } })

    await user.click(screen.getByRole('button', { name: 'ColorFitで調整する' }))

    expect(processImageMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      expect.objectContaining({
        strength: 0.4,
        palette: expect.arrayContaining([
          expect.objectContaining({ name: 'primary', color: '#FF0000' }),
        ]),
      }),
    )
  })
})
