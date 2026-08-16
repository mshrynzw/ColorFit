import { PageShell } from '../components/layout/PageShell'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'

export function EditorPage() {
  return (
    <PageShell
      title="画像を調整"
      documentTitle={PAGE_TITLES[ROUTES.editor]}
      description="まだ画像がアップロードされていません。"
      action={{ to: ROUTES.home, label: 'ホームへ戻る' }}
    />
  )
}
