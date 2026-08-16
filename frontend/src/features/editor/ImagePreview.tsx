type ImagePreviewProps = {
  src: string
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className="relative aspect-16/10 overflow-hidden rounded-md border border-glass-border bg-linear-to-br from-[#1c2130] to-[#0c0e14]">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
