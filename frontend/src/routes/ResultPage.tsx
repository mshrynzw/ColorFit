import { PageShell } from '../components/layout/PageShell'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'

export function ResultPage() {
  return (
    <PageShell
      title="調整結果"
      documentTitle={PAGE_TITLES[ROUTES.result]}
      description="まだ調整結果がありません。"
      action={{ to: ROUTES.editor, label: 'エディターへ戻る' }}
    />
  )
}
