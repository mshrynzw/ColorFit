import { ButtonLink } from '../../components/ui/Button'
import { ROUTES } from '../../lib/constants/routes'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative z-10 overflow-hidden py-24 md:py-40"
      aria-label="ColorFitをはじめる"
      data-anim="cta"
    >
      <div className="final-cta__glow" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-5 text-center md:px-8">
        <h2
          className="font-heading text-3xl font-bold md:text-[44px]"
          data-anim="section-fade"
        >
          画像の色を、デザインに。
        </h2>
        <p className="mt-4 text-text-muted" data-anim="section-fade">
          今すぐColorFitで、配色に馴染む画像を。
        </p>
        <div className="mt-10 flex w-full justify-center sm:w-auto" data-anim="section-fade">
          <ButtonLink to={ROUTES.editor} size="large" className="w-full sm:w-auto">
            ColorFitをはじめる
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
