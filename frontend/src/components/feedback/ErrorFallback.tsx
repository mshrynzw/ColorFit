import { usePageTitle } from '../../hooks/usePageTitle'
import { Button } from '../ui/Button'
import { EmptyState } from './EmptyState'

export function ErrorFallback() {
  usePageTitle('問題が発生しました ― ColorFit')

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+48px)] pb-20"
    >
      <div className="mx-auto max-w-[640px] px-5 md:px-8">
        <EmptyState
          tone="error"
          title="問題が発生しました。"
          description="ページを再読み込みしてください。"
          hint="再読み込みしても続く場合は、ホームから操作をやり直してください。"
          action={
            <Button
              onClick={() => {
                window.location.reload()
              }}
            >
              再読み込み
            </Button>
          }
        />
      </div>
    </main>
  )
}
