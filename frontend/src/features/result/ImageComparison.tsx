import { useCallback, useId, useRef, useState, type PointerEvent } from 'react'

import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'

type ViewMode = 'before' | 'after' | 'compare'

type ImageComparisonProps = {
  originalUrl: string
  processedUrl: string
  originalAlt: string
  processedAlt: string
}

export function ImageComparison({
  originalUrl,
  processedUrl,
  originalAlt,
  processedAlt,
}: ImageComparisonProps) {
  const sliderId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewMode>('after')
  const [split, setSplit] = useState(50)

  const updateSplit = useCallback((clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const next = ((clientX - rect.left) / rect.width) * 100
    setSplit(Math.max(0, Math.min(100, next)))
  }, [])

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateSplit(event.clientX)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateSplit(event.clientX)
    }
  }

  return (
    <figure className="glass-panel result-figure">
      <div ref={wrapRef} className="result-image-wrap">
        {view === 'compare' ? (
          <div
            className="result-compare"
            role="slider"
            tabIndex={0}
            aria-label="調整前・調整後の比較スライダー"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split)}
            aria-orientation="horizontal"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                setSplit((value) => Math.max(0, value - 5))
              }
              if (event.key === 'ArrowRight') {
                setSplit((value) => Math.min(100, value + 5))
              }
            }}
          >
            <div className="result-compare__layer">
              <img src={originalUrl} alt={originalAlt} />
              <span className="result-compare__tag result-compare__tag--before">
                調整前
              </span>
            </div>
            <div
              className="result-compare__layer result-compare__layer--after"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
              <img src={processedUrl} alt={processedAlt} />
              <span className="result-compare__tag result-compare__tag--after">
                調整後
              </span>
            </div>
            <div
              className="result-compare__handle"
              style={{ left: `${split}%` }}
              aria-hidden="true"
            >
              <span className="result-compare__grip">
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4L2 8l4 4M10 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        ) : (
          <img
            className="result-simple-image"
            src={view === 'before' ? originalUrl : processedUrl}
            alt={view === 'before' ? originalAlt : processedAlt}
          />
        )}
      </div>
      <figcaption className="result-toggle-row">
        <div className="result-toggle-group" role="group" aria-label="表示切り替え">
          <button
            type="button"
            className={cn('result-toggle-btn', view === 'before' && 'is-active')}
            aria-pressed={view === 'before'}
            onClick={() => {
              setView('before')
            }}
          >
            調整前
          </button>
          <button
            type="button"
            className={cn('result-toggle-btn', view === 'after' && 'is-active')}
            aria-pressed={view === 'after'}
            onClick={() => {
              setView('after')
            }}
          >
            調整後
          </button>
        </div>
        <Button
          variant="ghost"
          size="small"
          aria-pressed={view === 'compare'}
          onClick={() => {
            setView((current) => (current === 'compare' ? 'after' : 'compare'))
          }}
        >
          比較する
        </Button>
      </figcaption>
      <span id={sliderId} className="sr-only">
        スライダーで調整前と調整後を比較できます
      </span>
    </figure>
  )
}
