import { Card } from '../../components/ui/Card'

const FEATURES = [
  {
    title: 'デザインの色を解析',
    description:
      'Webデザインのカラーパレットを読み取り、画像との色の関係を分析します。',
  },
  {
    title: '写真を自然に調整',
    description: '画像の雰囲気を保ちながら、色相・彩度・明度などを調整します。',
  },
  {
    title: 'デザインに馴染む',
    description: 'Webサイト全体のトーンに自然に馴染む画像を作成します。',
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
        <p className="text-sm tracking-[0.16em] text-primary">Feature</p>
        <h2 className="font-heading mt-3 text-3xl font-bold md:text-4xl">
          ColorFitについて
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-7">
              <h3 className="font-heading text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
