# ColorFit Frontend

ColorFit の Frontend です。React / TypeScript / Vite で構成しています。

## 必要環境

- Node.js 20 以上
- pnpm

## セットアップ

```bash
pnpm install
```

環境変数は `.env.example` をコピーして用意します。

```bash
cp .env.example .env
```

## 起動

```bash
pnpm dev
```

開発サーバーは `http://localhost:5173` で起動します。

主な Route：

```text
/
/editor
/result
/settings
```

## 主なスクリプト

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm test
```
