# ColorFit

Webデザイナー向けの画像カラー調整Webアプリケーションです。
Webデザインの配色と配色比率を入力すると、そのデザインに馴染むように画像の色調を調整します。

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/1185148f-11a3-4219-a141-c675f9b9de26" />

## 技術スタック

### Frontend

- React
- TypeScript
- React Router
- Vite
- Tailwind CSS
- GSAP

### Backend

- Python
- FastAPI
- Pydantic

### Infrastructure

- Vercel
- Render
- Cloudflare R2

## 構成

```text
colorfit/
├── frontend/   React / TypeScript / Vite
├── backend/    Python / FastAPI
└── docs/       設計書
```

## 開発環境の起動

Frontend と Backend は別プロセスで起動します。

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

`http://localhost:5173`

主な Route：

```text
/
/editor
/result
/settings
```

### Backend

```bash
cd backend
uv sync --all-groups
cp .env.example .env
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`http://localhost:8000`

- Health Check: `GET /health`
- OpenAPI UI: `http://localhost:8000/docs`
- Image Upload: `POST /api/images`

## ドキュメント

設計書は `docs/` を正とします。

本番公開の手順は `docs/10_deployment.md` を参照してください。

- Frontend: Vercel（`frontend/vercel.json`）
- Backend: Render（`render.yaml` / `backend/Dockerfile`）
- Storage: Cloudflare R2
- CI: `.github/workflows/ci.yml`
