import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <main className="max-w-md text-center">
          <p className="text-sm tracking-[0.25em] text-cyan-400 uppercase">
            ColorFit
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            開発環境が起動しています
          </h1>
          <p className="mt-3 text-zinc-400">
            Frontend の Project 基盤です。画面実装は次の Phase で進めます。
          </p>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
