# ColorFit デプロイ設計

## 1. 文書概要

本書は ColorFit MVP の Production Deploy 方針を定義する。

Hosting は Basic Design に従う。

```text
Frontend  Vercel
Backend   Render
Storage   Cloudflare R2
```

Secret は Git へ Commit しない。Environment Variable で管理する。

---

# 2. 構成

```text
Browser
 ↓
Vercel（React / Vite）
 ↓ HTTPS
Render（FastAPI）
 ↓
Cloudflare R2
```

---

# 3. Frontend（Vercel）

- Project Root: `frontend`
- Framework: Vite
- Build: `pnpm build`
- Output: `frontend/dist`
- SPA Route は `frontend/vercel.json` の rewrite で `index.html` にフォールバックする

## 3.1 Environment Variables

Vercel の Environment Variable に設定する。Build 時に埋め込まれる。

```text
VITE_API_BASE_URL=https://<backend-host>
```

例：

```text
VITE_API_BASE_URL=https://colorfit-api.onrender.com
```

末尾の `/` は不要。

## 3.2 Deploy手順

1. Vercel で GitHub Repository を Import する
2. Root Directory を `frontend` にする
3. `VITE_API_BASE_URL` を Production に設定する
4. Deploy する
5. 発行された Frontend Origin を控える（Backend の `CORS_ORIGINS` に使う）

---

# 4. Backend（Render）

- Runtime: Docker（`backend/Dockerfile`）
- Blueprint: リポジトリ直下の `render.yaml`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check: `GET /health` および `HEAD /health`

## 4.1 Environment Variables

Render Dashboard または Blueprint で設定する。

必須：

```text
APP_ENV=production
CORS_ORIGINS=https://<frontend-host>
STORAGE_BACKEND=r2
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=<bucket-name>
```

任意（既定値あり）：

```text
LOG_LEVEL=INFO
MAX_UPLOAD_SIZE=10485760
MAX_IMAGE_WIDTH=8192
MAX_IMAGE_HEIGHT=8192
MAX_PIXEL_COUNT=20000000
IMAGE_TTL_HOURS=24
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_UPLOAD=30
RATE_LIMIT_PROCESS=20
RATE_LIMIT_DOWNLOAD=60
```

`CORS_ORIGINS` に `*` は使わない。Frontend Origin のみをカンマ区切りで指定する。

Production 起動時、`CORS_ORIGINS` が空、または `STORAGE_BACKEND=r2` なのに R2 設定が欠けている場合は起動に失敗する。

## 4.2 Deploy手順

1. Render で GitHub Repository を接続する
2. `render.yaml` の Blueprint を使うか、Web Service の Root を Docker / `backend` にする
3. 上記 Environment Variables を設定する
4. Deploy する
5. `https://<backend-host>/health` が `{"status":"ok"}` を返すことを確認する

Render の無料枠は Sleep することがある。初回アクセスで Cold Start が発生し得る。

---

# 5. Storage（Cloudflare R2）

Development では Local Filesystem（`STORAGE_BACKEND=local`）を使う。

Production では Cloudflare R2 を使う。Frontend から R2 へ直接アクセスしない。

```text
Frontend
 ↓
FastAPI
 ↓
Storage Service
 ↓
Cloudflare R2
```

## 5.1 準備

1. Cloudflare で R2 Bucket を作成する
2. API Token（Access Key / Secret）を発行する
3. S3 互換 Endpoint を控える
4. Render の Environment Variable に設定する

Object Key は Backend が UUID で生成する。元ファイル名は Key に使わない。

---

# 6. 推奨する公開順

```text
1. R2 Bucket と API Token を用意する
2. Backend を Render へ Deploy する
3. GET /health を確認する
4. Frontend を Vercel へ Deploy する（VITE_API_BASE_URL に Backend URL）
5. Backend の CORS_ORIGINS を Frontend Origin に更新して再 Deploy する
6. Home → Editor → Upload → Process → Result → Download を確認する
```

---

# 7. Production Build

## Frontend

```bash
cd frontend
pnpm install
pnpm lint
pnpm typecheck
pnpm test
VITE_API_BASE_URL=https://<backend-host> pnpm build
```

## Backend

```bash
cd backend
uv sync --all-groups
uv run ruff check .
uv run pytest
```

Docker Image：

```bash
docker build -t colorfit-api ./backend
```

---

# 8. CI

GitHub Actions（`.github/workflows/ci.yml`）で以下を実行する。

```text
Frontend: lint / typecheck / test / build
Backend: ruff / pytest
```

Hosting への自動 Deploy は Vercel / Render の GitHub 連携に任せる。CI に Secret を置かない。

---

# 9. Health Check

```http
GET /health
```

```json
{"status":"ok"}
```

Render の Health Check Path は `/health` とする。OpenAPI UI は Production では公開しない。

---

# 10. Secret管理

以下は Git に含めない。

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
Vercel / Render の Token
.env
```

`.env.example` と `backend/.env.example` のみを Repository に置く。

---

# 11. 完了条件

- [x] Frontend の Production Build 設定がある
- [x] Backend の Production 起動設定がある
- [x] Storage は Production で R2 を使う方針である
- [x] Environment Variables が定義されている
- [x] CORS は Frontend Origin のみである
- [x] API URL は `VITE_API_BASE_URL` で設定する
- [x] Health Check がある
- [ ] Vercel / Render / R2 への実 Deploy は Hosting アカウント設定後に行う
