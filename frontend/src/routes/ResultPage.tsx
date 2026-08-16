import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '../components/feedback/EmptyState'
import { ButtonLink } from '../components/ui/Button'
import { DownloadButton } from '../features/result/DownloadButton'
import { ImageComparison } from '../features/result/ImageComparison'
import { ResultHero } from '../features/result/ResultHero'
import { ResultInfo } from '../features/result/ResultInfo'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePageTitle } from '../hooks/usePageTitle'
import { useResult } from '../hooks/useResult'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'
import { getGsap } from '../lib/gsap'

export function ResultPage() {
  usePageTitle(PAGE_TITLES[ROUTES.result])
  const [searchParams] = useSearchParams()
  const imageId = searchParams.get('imageId')
  const result = useResult(imageId)
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reducedMotion || result.status !== 'success' || !rootRef.current) {
      return
    }
    const { gsap } = getGsap()
    const context = gsap.context(() => {
      gsap.from('[data-anim="result-in"]', {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      })
    }, rootRef)
    return () => {
      context.revert()
    }
  }, [reducedMotion, result.status])

  if (result.status === 'empty' || !imageId) {
    return (
      <ResultFeedback
        title="調整結果"
        description="まだ調整結果がありません。"
        hint="エディターで画像を調整すると、ここに結果が表示されます。"
      />
    )
  }

  if (result.status === 'loading') {
    return (
      <ResultFeedback
        title="調整結果"
        description="調整結果を読み込んでいます…"
        tone="loading"
        busy
      />
    )
  }

  if (result.status === 'error' || !result.originalUrl || !result.processedUrl) {
    return (
      <ResultFeedback
        title="調整結果を表示できません"
        description={
          result.errorMessage ?? '処理結果が見つかりません。'
        }
        hint="エディターで画像を調整し直すか、別の画像でお試しください。"
        tone="error"
      />
    )
  }

  return (
    <main
      ref={rootRef}
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+28px)] pb-20"
    >
      <h1 className="sr-only">調整結果</h1>
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-7">
        <div data-anim="result-in">
          <ResultHero />
        </div>
        <div className="result-grid mt-10">
          <section className="min-w-0" aria-label="調整結果の画像" data-anim="result-in">
            <ImageComparison
              originalUrl={result.originalUrl}
              processedUrl={result.processedUrl}
              originalAlt={
                result.image
                  ? `${result.image.filename}の調整前`
                  : '調整前の画像'
              }
              processedAlt={
                result.image
                  ? `${result.image.filename}の調整後`
                  : '調整後の画像'
              }
            />
            {result.image ? (
              <p className="editor-image-meta mt-4 text-text-subtle">
                <span>
                  {result.image.width} × {result.image.height} px
                </span>
                <span aria-hidden="true">・</span>
                <span>WebP</span>
              </p>
            ) : null}
          </section>
          <aside className="flex flex-col gap-4" aria-label="調整結果の詳細" data-anim="result-in">
            <ResultInfo palette={result.palette} strength={result.strength} />
            <div className="flex flex-col gap-3">
              <DownloadButton
                imageId={imageId}
                filename={result.image?.filename}
              />
              <ButtonLink
                to={`${ROUTES.editor}?imageId=${imageId}`}
                variant="ghost"
                size="large"
                className="w-full"
              >
                もう一度調整する
              </ButtonLink>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function ResultFeedback({
  title,
  description,
  hint,
  tone = 'empty',
  busy = false,
}: {
  title: string
  description: string
  hint?: string
  tone?: 'empty' | 'error' | 'loading'
  busy?: boolean
}) {
  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+48px)] pb-20"
      aria-busy={busy || undefined}
    >
      <div className="mx-auto max-w-[640px] px-5 md:px-8">
        <EmptyState
          title={title}
          description={description}
          hint={hint}
          tone={tone}
          busy={busy}
          action={<ButtonLink to={ROUTES.editor}>エディターへ戻る</ButtonLink>}
        />
      </div>
    </main>
  )
}
