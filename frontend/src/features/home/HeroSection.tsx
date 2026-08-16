import type { CSSProperties } from 'react'

import { ButtonLink } from '../../components/ui/Button'
import { getButtonClassName } from '../../components/ui/button-styles'
import { ROUTES } from '../../lib/constants/routes'

const PALETTE_CHIPS = [
  { color: '#1E3A5F', hex: '#1E3A5F' },
  { color: '#D8B26E', hex: '#D8B26E' },
  { color: '#F5F1E8', hex: '#F5F1E8' },
] as const

export function HeroSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-5 pt-32 pb-20 md:px-8 md:pt-44 md:pb-28">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <p
            className="hero-eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-[13px] tracking-[0.08em] text-primary"
            data-anim="fade-up"
          >
            クリエイター向け・自動カラーマッチング
          </p>
          <h1
            className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-5xl"
            data-anim="fade-up"
          >
            Webデザインに、
            <br />
            画像の色を合わせる。
          </h1>
          <p className="mt-6 max-w-xl text-text-muted" data-anim="fade-up">
            あなたのデザインに合わせて、写真の色味を自動調整。
            配色を読み取り、画像を馴染ませる新しいワークフロー。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-anim="fade-up">
            <ButtonLink to={ROUTES.editor} size="large">
              無料ではじめる
            </ButtonLink>
            <a
              href="#how-it-works"
              className={getButtonClassName({ variant: 'ghost', size: 'large' })}
            >
              使い方を見る
            </a>
          </div>
        </div>

        <div
          id="how-it-works"
          className="hero-visual"
          data-anim="visual-scale"
          aria-label="ColorFitの機能ビジュアル：Webデザインの配色から画像を色調整する流れ"
        >
          <div className="glass-panel flex flex-col gap-5 p-5 md:p-7">
            <div>
              <p className="hero-visual-label">01 ／ デザインの配色</p>
              <div className="mt-3.5 flex flex-wrap gap-3">
                {PALETTE_CHIPS.map((chip) => (
                  <PaletteChip key={chip.hex} color={chip.color} hex={chip.hex} />
                ))}
              </div>
            </div>

            <div className="hero-visual-flow" aria-hidden="true">
              <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <path
                  d="M0,20 C50,0 150,40 200,20"
                  fill="none"
                  stroke="rgb(94 234 212 / 0.5)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              </svg>
            </div>

            <div className="hero-image-compare">
              <div className="min-w-0">
                <p className="hero-visual-label">02 ／ 元の画像</p>
                <LandscapeFrame alt="調整前の風景イメージ" />
              </div>
              <div className="hero-image-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12h16m0 0l-6-6m6 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>ColorFit</span>
              </div>
              <div className="min-w-0">
                <p className="hero-visual-label">03 ／ 調整後の画像</p>
                <LandscapeFrame alt="配色に合わせて色調整した風景イメージ" tinted />
              </div>
            </div>
          </div>
          <p className="mt-4 px-1 text-[13.5px] leading-relaxed text-text-subtle">
            配色を解析し、画像の色相・彩度・明度をデザインに合わせて自動調整します。
          </p>
        </div>
      </div>
    </section>
  )
}

type PaletteChipProps = {
  color: string
  hex: string
}

function PaletteChip({ color, hex }: PaletteChipProps) {
  return (
    <div
      className="hero-chip"
      data-anim="chip"
      style={{ '--chip-color': color } as CSSProperties}
    >
      <span className="hero-chip__swatch" />
      <span className="font-mono text-[12.5px] tracking-[0.02em] text-text-muted">{hex}</span>
    </div>
  )
}

type LandscapeFrameProps = {
  alt: string
  tinted?: boolean
}

function LandscapeFrame({ alt, tinted = false }: LandscapeFrameProps) {
  return (
    <div
      className={tinted ? 'hero-image-frame hero-image-frame--tinted' : 'hero-image-frame'}
      role="img"
      aria-label={alt}
    >
      <div className="hero-landscape" aria-hidden="true">
        <span className="hero-landscape__sun" />
        <span className="hero-landscape__ridge" />
      </div>
      {tinted ? <div className="hero-image-tint" aria-hidden="true" /> : null}
    </div>
  )
}
