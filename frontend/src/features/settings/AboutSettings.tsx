import { APP_VERSION } from '../../lib/constants/settings'
import { SettingCard } from './SettingCard'

export function AboutSettings() {
  return (
    <SettingCard
      title="このアプリについて"
      description="ColorFitのバージョンと技術構成です。"
    >
      <dl className="about-list">
        <div className="about-list__row">
          <dt>アプリ</dt>
          <dd>ColorFit</dd>
        </div>
        <div className="about-list__row">
          <dt>バージョン</dt>
          <dd>{APP_VERSION}</dd>
        </div>
        <div className="about-list__row">
          <dt>Frontend</dt>
          <dd>React / TypeScript</dd>
        </div>
        <div className="about-list__row">
          <dt>Backend</dt>
          <dd>FastAPI / Python</dd>
        </div>
      </dl>
    </SettingCard>
  )
}
