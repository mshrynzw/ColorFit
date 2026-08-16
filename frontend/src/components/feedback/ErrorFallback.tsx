import { usePageTitle } from '../../hooks/usePageTitle'
import { Container } from '../layout/Container'
import { Button } from '../ui/Button'

export function ErrorFallback() {
  usePageTitle('問題が発生しました ― ColorFit')

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+48px)] pb-20"
    >
      <Container>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          問題が発生しました。
        </h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          ページを再読み込みしてください。
        </p>
        <div className="mt-8">
          <Button
            onClick={() => {
              window.location.reload()
            }}
          >
            再読み込み
          </Button>
        </div>
      </Container>
    </main>
  )
}
