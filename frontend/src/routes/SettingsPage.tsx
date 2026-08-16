import { PageShell } from '../components/layout/PageShell'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'

export function SettingsPage() {
  return (
    <PageShell
      title="設定"
      documentTitle={PAGE_TITLES[ROUTES.settings]}
      description="設定項目はこれから追加されます。"
      action={{ to: ROUTES.home, label: 'ホームへ戻る' }}
    />
  )
}
