const FEATURES = [
  {
    title: 'デザインの色を解析',
    description:
      'Webデザインのカラーパレットを読み取り、画像との色の関係を分析します。',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="20" cy="12" r="2.4" fill="currentColor" />
        <circle cx="27" cy="22" r="2.4" fill="currentColor" />
        <circle cx="13" cy="22" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: '写真を自然に調整',
    description: '画像の雰囲気を保ちながら、色相・彩度・明度などを調整します。',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <path
          d="M8 28V16m8 12V10m8 18v-8m8 8V14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="8" cy="14" r="2.2" fill="currentColor" />
        <circle cx="16" cy="9" r="2.2" fill="currentColor" />
        <circle cx="24" cy="19" r="2.2" fill="currentColor" />
        <circle cx="32" cy="13" r="2.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'デザインに馴染む',
    description: 'Webサイト全体のトーンに自然に馴染む画像を作成します。',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect x="9" y="9" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="15" y="15" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
] as const

export function FeatureSection() {
  return (
    <section
      id="features"
      className="relative z-10 py-16 md:py-24"
      aria-label="ColorFitの特徴"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <p className="text-[12.5px] tracking-[0.12em] text-text-subtle uppercase">
          Feature
        </p>
        <h2 className="font-heading mt-3.5 text-3xl font-bold md:text-4xl">
          ColorFitについて
        </h2>
        <div
          className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-anim="feature-grid"
        >
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="feature-card md:last:col-span-2 lg:last:col-span-1"
              data-anim="feature-card"
            >
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="font-heading text-[19px] font-semibold">{feature.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
