export function processedDownloadName(
  filename: string | null | undefined,
  mode: 'original' | 'colorfit' = 'original',
): string {
  const base = (filename ?? '')
    .replaceAll('\0', '')
    .replace(/^.*[/\\]/, '')
    .trim()
  const lastDot = base.lastIndexOf('.')
  const stem = (lastDot > 0 ? base.slice(0, lastDot) : base).trim()
  const suffix = mode === 'colorfit' ? '-colorfit' : ''
  return `${stem || 'image'}${suffix}.webp`
}
