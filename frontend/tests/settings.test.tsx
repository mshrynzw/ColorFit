import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { appRoutes } from '../src/app/router'
import { SETTINGS_STORAGE_KEY } from '../src/lib/constants/settings'

function renderSettings() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/settings'],
  })
  return render(<RouterProvider router={router} />)
}

describe('settings page', () => {
  it('renders settings categories and about information', () => {
    renderSettings()

    expect(screen.getByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '基本設定' })).toBeInTheDocument()
    expect(screen.getByText('このアプリについて')).toBeInTheDocument()
    expect(screen.getByText('0.1.0')).toBeInTheDocument()
  })

  it('shows unsaved state, saves to localStorage, and can reset', async () => {
    const user = userEvent.setup()
    renderSettings()

    await user.click(screen.getByRole('tab', { name: '外観' }))
    await user.click(screen.getByRole('button', { name: 'ライト' }))

    expect(screen.getAllByText('未保存の変更').length).toBeGreaterThan(0)
    expect(
      screen.getByText('MVPではダークテーマで表示します。選択内容は保存されます。'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '変更を保存' }))
    expect(await screen.findByText('設定を保存しました')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}') as {
      theme: string
    }
    expect(stored.theme).toBe('light')

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
    renderSettings()

    await user.click(screen.getByRole('tab', { name: '書き出し' }))
    expect(screen.getByText('ファイル名の初期値')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '基本設定で変更' }))
    expect(screen.getByRole('tab', { name: '基本設定' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
