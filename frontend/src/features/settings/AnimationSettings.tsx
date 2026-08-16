import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Switch } from '../../components/ui/Switch'
import { UI_ANIMATION_OPTIONS } from '../../lib/constants/settings'
import type { AnimationMode } from '../../types/settings'
import { SettingCard } from './SettingCard'

type AnimationSettingsProps = {
  uiAnimation: AnimationMode
  processingAnimation: boolean
  reduceMotion: boolean
  osReducedMotion: boolean
  onUiAnimationChange: (value: AnimationMode) => void
  onProcessingAnimationChange: (value: boolean) => void
  onReduceMotionChange: (value: boolean) => void
}

export function AnimationSettings({
  uiAnimation,
  processingAnimation,
  reduceMotion,
  osReducedMotion,
  onUiAnimationChange,
  onProcessingAnimationChange,
  onReduceMotionChange,
}: AnimationSettingsProps) {
  return (
    <>
      <SettingCard
        title="UIアニメーション"
        description="画面全体のインターフェースアニメーションの量を設定します。"
      >
        <SegmentedControl
          label="UIアニメーション"
          value={uiAnimation}
          options={UI_ANIMATION_OPTIONS}
          onChange={onUiAnimationChange}
        />
      </SettingCard>
      <SettingCard
        title="画像処理アニメーション"
        description="ColorFitによる画像処理中の視覚的な演出を設定します。"
        action={
          <Switch
            checked={processingAnimation}
            onChange={onProcessingAnimationChange}
            label="画像処理アニメーション"
          />
        }
      />
      <SettingCard
        title="モーションを減らす"
        description="画面上のアニメーションや動きを最小限にします。"
        action={
          <Switch
            checked={osReducedMotion || reduceMotion}
            onChange={onReduceMotionChange}
            label="モーションを減らす"
            disabled={osReducedMotion}
          />
        }
        note={
          osReducedMotion ? (
            <p className="setting-card__note">
              OSの「モーションを減らす」設定が有効なため、自動的に適用されています。
            </p>
          ) : null
        }
      />
    </>
  )
}
