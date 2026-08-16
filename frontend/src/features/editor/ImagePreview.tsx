type ImagePreviewProps = {
  src: string
  alt: string
  badge?: string
}

export function ImagePreview({ src, alt, badge }: ImagePreviewProps) {
  return (
    <div className="relative aspect-16/10 overflow-hidden rounded-md border border-glass-border bg-linear-to-br from-[#1c2130] to-[#0c0e14]">
      <img
        key={src}
        src={src}
        alt={alt}
        className="editor-preview-image h-full w-full object-contain"
      />
      {badge ? (
        <span className="editor-preview-badge">{badge}</span>
      ) : null}
    </div>
  )
}
