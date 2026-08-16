import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EmptyState } from '../src/components/feedback/EmptyState'

describe('empty state', () => {
  it('shows icon, heading, description, and action', () => {
    render(
      <MemoryRouter>
        <EmptyState
          title="調整結果"
          description="まだ調整結果がありません。"
          hint="エディターで画像を調整すると、ここに結果が表示されます。"
          action={<a href="/editor">エディターへ戻る</a>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '調整結果' })).toBeInTheDocument()
    expect(screen.getByText('まだ調整結果がありません。')).toBeInTheDocument()
    expect(
      screen.getByText('エディターで画像を調整すると、ここに結果が表示されます。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'エディターへ戻る' })).toBeInTheDocument()
  })

  it('announces a loading description as a status', () => {
    render(
      <EmptyState
        tone="loading"
        busy
        title="調整結果"
        description="調整結果を読み込んでいます…"
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      '調整結果を読み込んでいます…',
    )
  })
})
