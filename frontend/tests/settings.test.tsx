import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { appRoutes } from '../src/app/router'
import { SETTINGS_STORAGE_KEY } from '../src/lib/constants/settings'

async function renderSettings() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/settings'],
  })
  const view = render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1, name: '設定' })
  return view
}

describe('settings page', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'dark'
  })

  it('renders settings categories and about information', async () => {
    await renderSettings()

    expect(await screen.findByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '基本設定' })).toBeInTheDocument()
    expect(screen.getByText('このアプリについて')).toBeInTheDocument()
    expect(screen.getByText('0.1.0')).toBeInTheDocument()
  })

  it('shows unsaved state, saves to localStorage, and can reset', async () => {
    const user = userEvent.setup()
    await renderSettings()

    await screen.findByRole('heading', { level: 1, name: '設定' })
    await user.click(screen.getByRole('tab', { name: '外観' }))
    await user.click(screen.getByRole('button', { name: 'ライト' }))

    expect(screen.getAllByText('未保存の変更').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '変更を保存' }))
    expect(await screen.findByText('設定を保存しました')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}') as {
      theme: string
    }
    expect(stored.theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    await user.click(screen.getByRole('button', { name: '設定を初期状態に戻す' }))
    await user.click(screen.getByRole('button', { name: '初期状態に戻す' }))
    expect(screen.getByRole('button', { name: 'ダーク' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getAllByText('未保存の変更').length).toBeGreaterThan(0)
  })

  it('switches to the export panel from the summary link', async () => {
    const user = userEvent.setup()
    await renderSettings()

    await user.click(screen.getByRole('tab', { name: '書き出し' }))
    expect(screen.getByText('ファイル名の初期値')).toBeInTheDocument()
    expect(screen.queryByText('画像のメタデータを保持する')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '基本設定で変更' }))
    expect(screen.getByRole('tab', { name: '基本設定' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('hides processing options that are not connected yet', async () => {
    const user = userEvent.setup()
    await renderSettings()

    await user.click(screen.getByRole('tab', { name: '画像処理' }))
    expect(screen.getByLabelText('色調整の強度')).toBeInTheDocument()
    expect(screen.queryByText('自動調整を有効にする')).not.toBeInTheDocument()
    expect(screen.queryByText('自然な色味を優先')).not.toBeInTheDocument()
  })
})
