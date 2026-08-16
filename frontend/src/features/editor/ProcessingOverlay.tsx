type ProcessingOverlayProps = {
  message: string
  variant: 'upload' | 'process'
  animated?: boolean
}

export function ProcessingOverlay({
  message,
  variant,
  animated = true,
}: ProcessingOverlayProps) {
  const isProcess = variant === 'process'

  return (
    <div
      className={
        isProcess
          ? 'editor-processing-overlay'
          : 'absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-[rgb(6_7_10_/_0.62)]'
      }
      aria-hidden="true"
    >
      {isProcess && animated ? (
        <>
          <div className="editor-processing-overlay__scanline" aria-hidden="true" />
          <div className="editor-processing-overlay__sweep" aria-hidden="true" />
        </>
      ) : null}
      <p
        className={
          isProcess
            ? 'editor-processing-overlay__status'
            : 'text-sm font-medium text-primary'
        }
      >
        {message}
      </p>
    </div>
  )
}
