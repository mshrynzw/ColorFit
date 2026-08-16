import { LoadingIndicator } from '../feedback/LoadingIndicator'

export function PageLoading() {
  return (
    <main
      id="main"
      className="relative z-10 flex justify-center pt-[calc(var(--header-h)+48px)] pb-20"
      aria-busy="true"
    >
      <LoadingIndicator label="読み込んでいます" />
    </main>
  )
}
