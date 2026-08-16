import { Button } from '../../components/ui/Button'
import { useSettings } from '../../hooks/useSettings'
import { cn } from '../../lib/cn'

type SettingsSaveButtonProps = {
  size?: 'small' | 'large'
  className?: string
}

export function SettingsSaveButton({
  size = 'large',
  className,
}: SettingsSaveButtonProps) {
  const { save, saveStatus } = useSettings()
  const idleLabel = size === 'small' ? '保存' : '変更を保存'

  return (
    <Button
      size={size}
      className={cn(saveStatus === 'saved' && 'is-save-success', className)}
      disabled={saveStatus === 'saving'}
      aria-busy={saveStatus === 'saving'}
      onClick={save}
    >
      {saveStatus === 'saving'
        ? '保存中…'
        : saveStatus === 'saved'
          ? '保存しました'
          : idleLabel}
    </Button>
  )
}
