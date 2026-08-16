import { ButtonLink } from '../../components/ui/Button'
import { ROUTES } from '../../lib/constants/routes'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative z-10 py-24 md:py-32"
      aria-label="ColorFitをはじめる"
    >
      <div className="mx-auto max-w-[1200px] px-5 text-center md:px-8">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          画像の色を、デザインに。
        </h2>
        <p className="mt-4 text-text-muted">
          今すぐColorFitで、配色に馴染む画像を。
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink to={ROUTES.editor} size="large">
            ColorFitをはじめる
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
