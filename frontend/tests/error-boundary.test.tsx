import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from '../src/components/feedback/ErrorBoundary'

function Boom(): ReactNode {
  throw new Error('boom')
}

describe('error boundary', () => {
  it('shows a reload fallback for unexpected render errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(
      screen.getByRole('heading', { name: '問題が発生しました。' }),
    ).toBeInTheDocument()
    expect(screen.getByText('ページを再読み込みしてください。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()

    errorSpy.mockRestore()
  })
})
