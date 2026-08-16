import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ColorFitApiError } from '../src/api/client'
import { deleteImage, uploadImage } from '../src/api/images'
import { appRoutes } from '../src/app/router'

vi.mock('../src/api/images', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
}))

const uploadImageMock = vi.mocked(uploadImage)
const deleteImageMock = vi.mocked(deleteImage)

function renderEditor() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/editor'],
  })
  return render(<RouterProvider router={router} />)
}

function pngFile(name = 'sample.png') {
  return new File(['png-bytes'], name, { type: 'image/png' })
}

describe('editor image upload', () => {
  beforeEach(() => {
    vi.stubGlobal('createImageBitmap', async () => ({
      width: 32,
      height: 24,
      close: () => {},
    }))
    uploadImageMock.mockReset()
    deleteImageMock.mockReset()
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
  })

  it('shows an empty upload state', () => {
    renderEditor()

    expect(
      screen.getByRole('heading', { level: 1, name: '画像を調整' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('まだ画像がアップロードされていません。'),
    ).toBeInTheDocument()
    expect(screen.getByText('画像をここにドロップ')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'デザインの配色' })).toBeInTheDocument()
    expect(screen.getByLabelText('適用強度')).toHaveValue('0.7')
  })

  it('uploads a png and shows a preview', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())

    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()
    expect(screen.getByText('32 × 24 px')).toBeInTheDocument()
    expect(uploadImageMock).toHaveBeenCalledTimes(1)
  })

  it('rejects an unsupported file before calling the api', async () => {
    renderEditor()

    fireEvent.drop(screen.getByLabelText('画像のアップロード領域'), {
      dataTransfer: {
        files: [new File(['gif'], 'anim.gif', { type: 'image/gif' })],
      },
    })

    expect(
      await screen.findByText('対応していない画像形式です。'),
    ).toBeInTheDocument()
    expect(uploadImageMock).not.toHaveBeenCalled()
  })

  it('shows an api error message', async () => {
    const user = userEvent.setup()
    uploadImageMock.mockRejectedValue(
      new ColorFitApiError('STORAGE_UPLOAD_FAILED', '画像を保存できませんでした。', 503),
    )
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())

    expect(await screen.findByText('画像を保存できませんでした。')).toBeInTheDocument()
    expect(
      screen.getByText('まだ画像がアップロードされていません。'),
    ).toBeInTheDocument()
  })

  it('removes an uploaded image', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.upload(screen.getByLabelText('画像ファイルを選択'), pngFile())
    expect(await screen.findByAltText('sample.pngのプレビュー')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '画像を削除' }))

    await waitFor(() => {
      expect(screen.getByText('画像をここにドロップ')).toBeInTheDocument()
    })
    expect(deleteImageMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    )
  })
})
