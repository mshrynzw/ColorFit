import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ColorFitApiError } from '../src/api/client'
import { downloadImage, getImage, getResult } from '../src/api/images'
import { appRoutes } from '../src/app/router'

vi.mock('../src/api/images', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  processImage: vi.fn(),
  downloadImage: vi.fn(),
  getImage: vi.fn(),
  getResult: vi.fn(),
}))

const downloadImageMock = vi.mocked(downloadImage)
const getImageMock = vi.mocked(getImage)
const getResultMock = vi.mocked(getResult)

function renderResult(path = '/result') {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })
  return render(<RouterProvider router={router} />)
}

describe('result page', () => {
  beforeEach(() => {
    downloadImageMock.mockReset()
    getImageMock.mockReset()
    getResultMock.mockReset()
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
    downloadImageMock.mockImplementation(async (_id, source) => {
      return new Blob([source === 'original' ? 'original' : 'processed'], {
        type: source === 'original' ? 'image/png' : 'image/webp',
      })
    })
  })

  it('shows an empty state without a result id', () => {
    renderResult('/result')

    expect(screen.getByRole('heading', { name: '調整結果' })).toBeInTheDocument()
    expect(screen.getByText('まだ調整結果がありません。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'エディターへ戻る' })).toBeInTheDocument()
  })

  it('loads before and after images for a processed result', async () => {
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()
    expect(screen.getByAltText('sample.pngの調整後')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '画像を書き出す' })).toBeInTheDocument()
    expect(screen.getByText('適用強度')).toBeInTheDocument()
    expect(downloadImageMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      'original',
    )
  })

  it('switches to the original image', async () => {
    const user = userEvent.setup()
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(await screen.findByAltText('sample.pngの調整後')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '調整前' }))
    expect(screen.getByAltText('sample.pngの調整前')).toBeInTheDocument()
  })

  it('opens the comparison slider', async () => {
    const user = userEvent.setup()
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(await screen.findByAltText('sample.pngの調整後')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '比較する' }))
    expect(
      screen.getByRole('slider', { name: '調整前・調整後の比較スライダー' }),
    ).toBeInTheDocument()
  })

  it('downloads the processed image', async () => {
    const user = userEvent.setup()
    const downloads: string[] = []
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download)
      })
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '画像を書き出す' }))
    expect(await screen.findByText('画像を書き出しました。')).toBeInTheDocument()
    expect(click).toHaveBeenCalled()
    expect(downloads[0]).toBe('sample.webp')
    click.mockRestore()
  })

  it('shows an error when the result is missing', async () => {
    getResultMock.mockRejectedValue(
      new ColorFitApiError('IMAGE_NOT_FOUND', '処理結果が見つかりません。', 404),
    )
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(await screen.findByText('処理結果が見つかりません。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'エディターへ戻る' })).toBeInTheDocument()
  })

  it('shows a loading state while the result is fetched', () => {
    getResultMock.mockImplementation(() => new Promise(() => {}))
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')

    expect(screen.getByText('調整結果を読み込んでいます…')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows an error when download fails', async () => {
    const user = userEvent.setup()
    renderResult('/result?imageId=550e8400-e29b-41d4-a716-446655440000')
    expect(await screen.findByText('調整が完了しました')).toBeInTheDocument()

    downloadImageMock.mockRejectedValueOnce(
      new ColorFitApiError('STORAGE_DOWNLOAD_FAILED', '画像を取得できませんでした。', 503),
    )
    await user.click(screen.getByRole('button', { name: '画像を書き出す' }))
    expect(await screen.findByText('画像を取得できませんでした。')).toBeInTheDocument()
  })
})
