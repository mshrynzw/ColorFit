# ColorFit

Webデザイナー向けの画像カラー調整Webアプリ。

Webデザインの配色を入力すると、
そのデザインに馴染むように画像の色調を自動調整します。

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Vite

### Backend

- Python
- FastAPI
- Pillow
- NumPy

### Infrastructure

- Vercel
- Render
- Cloudflare R2

## Architecture

```text
React
  ↓
FastAPI
  ↓
Image Processing
  ↓
Pillow / NumPy
```

まだ実装していない技術については、後から実際に採用したものに合わせて更新すればOKです。

---

# 9. `.cursor/rules`を作る

ここからCursor用のルールです。

最初から大量に作らず、まずは**プロジェクト全体のルール1個**から始めるのがおすすめです。

```text
.cursor/
└── rules/
    └── project.mdc
```
