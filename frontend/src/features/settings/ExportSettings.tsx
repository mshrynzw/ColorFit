import { SegmentedControl } from '../../components/ui/SegmentedControl'
import {
  FILENAME_OPTIONS,
  FORMAT_LABELS,
  QUALITY_LABELS,
} from '../../lib/constants/settings'
import type {
  ExportFormat,
  ExportQuality,
  FilenameMode,
} from '../../types/settings'
import { SettingCard } from './SettingCard'

type ExportSettingsProps = {
  defaultFormat: ExportFormat
  defaultQuality: ExportQuality
  filenameMode: FilenameMode
  onFilenameModeChange: (value: FilenameMode) => void
  onGoToBasic: () => void
}

function previewName(filenameMode: FilenameMode, format: ExportFormat): string {
  const extension = format === 'jpeg' ? 'jpg' : format
  return filenameMode === 'colorfit'
    ? `hero-image-colorfit.${extension}`
    : `hero-image.${extension}`
}

export function ExportSettings({
  defaultFormat,
  defaultQuality,
  filenameMode,
  onFilenameModeChange,
  onGoToBasic,
}: ExportSettingsProps) {
  return (
    <>
      <SettingCard
        title="書き出し形式・画質"
        description="基本設定で指定した内容が書き出し全体に適用されます。"
      >
        <div className="export-summary">
          <span className="export-summary__chip">{FORMAT_LABELS[defaultFormat]}</span>
          <span className="export-summary__chip">
            {QUALITY_LABELS[defaultQuality]}
          </span>
          <button
            type="button"
            className="export-summary__link"
            onClick={onGoToBasic}
          >
            基本設定で変更
          </button>
        </div>
      </SettingCard>
      <SettingCard
        title="ファイル名の初期値"
        description="書き出す画像のファイル名をどのように生成するかを設定します。"
      >
        <SegmentedControl
          label="ファイル名の初期値"
          value={filenameMode}
          options={FILENAME_OPTIONS}
          onChange={onFilenameModeChange}
        />
        <div className="filename-preview">
          <span className="filename-preview__item">
            <span className="filename-preview__tag">元ファイル</span>
            <span className="filename-preview__name">hero-image.jpg</span>
          </span>
          <span className="filename-preview__arrow" aria-hidden="true">
            →
          </span>
          <span className="filename-preview__item">
            <span className="filename-preview__tag filename-preview__tag--accent">
              ColorFit
            </span>
            <span className="filename-preview__name">
              {previewName(filenameMode, defaultFormat)}
            </span>
          </span>
        </div>
      </SettingCard>
      {/* メタデータ保持は処理時に EXIF を残さない方針のため非表示
      <SettingCard
        title="画像のメタデータを保持する"
        description="画像に含まれるメタデータを可能な範囲で保持します。"
        action={
          <Switch
            checked={preserveMetadata}
            onChange={onPreserveMetadataChange}
            label="画像のメタデータを保持する"
          />
        }
      />
      */}
    </>
  )
}
