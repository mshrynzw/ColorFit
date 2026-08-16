import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'

type ProcessingButtonProps = {
  disabled: boolean
  loading: boolean
  hint: string
  hintIsError?: boolean
  onProcess: () => void
}

export function ProcessingButton({
  disabled,
  loading,
  hint,
  hintIsError = false,
  onProcess,
}: ProcessingButtonProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
      <Button
        variant="primary"
        size="large"
        disabled={disabled}
        aria-busy={loading}
        onClick={onProcess}
      >
        {loading ? '処理中…' : 'ColorFitで調整する'}
      </Button>
      <p
        role={hintIsError ? 'alert' : undefined}
        className={cn(
          'max-w-[440px] text-[12.5px]',
          hintIsError ? 'text-error' : 'text-text-subtle',
        )}
      >
        {hint}
      </p>
    </div>
  )
}
