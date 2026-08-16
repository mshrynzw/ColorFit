import { SettingCard } from './SettingCard'
import { ThemeSelector } from './ThemeSelector'
import type { ThemeMode } from '../../types/settings'

type AppearanceSettingsProps = {
  theme: ThemeMode
  onThemeChange: (value: ThemeMode) => void
}

export function AppearanceSettings({
  theme,
  onThemeChange,
}: AppearanceSettingsProps) {
  return (
    <>
      <SettingCard
        title="テーマ"
        description="ColorFitの表示テーマを設定します。"
        note={
          theme === 'dark' ? null : (
            <p className="setting-card__note">
              MVPではダークテーマで表示します。選択内容は保存されます。
            </p>
          )
        }
      >
        <ThemeSelector value={theme} onChange={onThemeChange} />
      </SettingCard>
      <SettingCard
        title="アクセントカラーのプレビュー"
        description="現在のUIアクセントカラーです。ColorFit全体で共通のカラーのため、ここでは変更できません。"
      >
        <div className="accent-preview">
          <span className="accent-preview__swatch" aria-hidden="true" />
          <div className="accent-preview__body">
            <span className="accent-preview__name">シアン</span>
            <span className="accent-preview__hex">#5EEAD4</span>
          </div>
        </div>
      </SettingCard>
    </>
  )
}
