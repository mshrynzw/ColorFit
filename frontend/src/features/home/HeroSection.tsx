import { ButtonLink } from '../../components/ui/Button'
import { ROUTES } from '../../lib/constants/routes'

export function HeroSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-5 pt-32 pb-20 md:px-8 md:pt-44 md:pb-28">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-glass-border bg-glass px-3.5 py-1.5 text-[13px] tracking-[0.08em] text-primary">
            クリエイター向け・自動カラーマッチング
          </p>
          <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-5xl">
            Webデザインに、
            <br />
            画像の色を合わせる。
          </h1>
          <p className="mt-6 max-w-xl text-text-muted">
            あなたのデザインに合わせて、写真の色味を自動調整。
            配色を読み取り、画像を馴染ませる新しいワークフロー。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={ROUTES.editor} size="large">
              無料ではじめる
            </ButtonLink>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-glass-border bg-glass px-8 py-4 text-base font-medium tracking-[0.02em] transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
            >
              使い方を見る
            </a>
          </div>
        </div>

        <div id="how-it-works" className="glass-panel p-6 md:p-8">
          <p className="text-xs tracking-[0.16em] text-text-subtle">
            01 ／ デザインの配色
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PaletteChip color="#1E3A5F" hex="#1E3A5F" />
            <PaletteChip color="#D8B26E" hex="#D8B26E" />
            <PaletteChip color="#F5F1E8" hex="#F5F1E8" />
          </div>
          <p className="mt-8 text-sm text-text-muted">
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
    <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-2">
      <span
        className="h-4 w-4 rounded-full border border-border-strong"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-xs text-text-muted">{hex}</span>
    </div>
  )
}
