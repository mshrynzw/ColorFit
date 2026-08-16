export function BackgroundLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-[-10%] opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 20%, black 30%, transparent 75%)',
        }}
      />
      <div className="bg-glow bg-glow--cyan absolute top-[-10%] left-[-10%] h-[60vw] max-h-[900px] w-[60vw] max-w-[900px] rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_70%)] opacity-[0.16] blur-[120px]" />
      <div className="bg-glow bg-glow--violet absolute top-[20%] right-[-15%] h-[60vw] max-h-[900px] w-[60vw] max-w-[900px] rounded-full bg-[radial-gradient(circle,var(--color-secondary),transparent_70%)] opacity-[0.16] blur-[120px]" />
      <div className="bg-noise" />
    </div>
  )
}
