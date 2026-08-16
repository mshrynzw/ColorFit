import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { appRoutes } from '../src/app/router'

function renderApp(path = '/') {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })

  return render(<RouterProvider router={router} />)
}

describe('frontend routes', () => {
  it('renders home with header and footer', () => {
    renderApp('/')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Webデザインに、画像の色を合わせる。',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('01 ／ デザインの配色')).toBeInTheDocument()
    expect(screen.getByText('02 ／ 元の画像')).toBeInTheDocument()
    expect(screen.getByText('03 ／ 調整後の画像')).toBeInTheDocument()
    expect(screen.getByText('デザインの色を解析')).toBeInTheDocument()
  })

  it('navigates from home to editor', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getAllByRole('link', { name: 'はじめる' })[0])

    expect(
      await screen.findByRole('heading', { level: 1, name: '画像を調整' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('まだ画像がアップロードされていません。'),
    ).toBeInTheDocument()
  })

  it('renders the result route', async () => {
    renderApp('/result')
    expect(
      await screen.findByRole('heading', { level: 1, name: '調整結果' }),
    ).toBeInTheDocument()
  })

  it('renders the settings route', async () => {
    renderApp('/settings')
    expect(
      await screen.findByRole('heading', { level: 1, name: '設定' }),
    ).toBeInTheDocument()
  })
})
