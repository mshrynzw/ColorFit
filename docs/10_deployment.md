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

- Framework: Vite
- Root Directory: `frontend`
- Build Command: `pnpm build`（Override は OFF でよい）
- Output Directory: `dist`（Root Directory からの相対パス）
- Install Command: Override OFF
- SPA Route は `frontend/vercel.json` の rewrite で `index.html` にフォールバックする

## 3.1 Output Directory の注意

Vercel の Output Directory は **Root Directory からの相対パス** である。

Root Directory がすでに `frontend` なのに、出力先を `frontend/dist` に上書きしてはならない。

```text
Root Directory: frontend
Output Directory: frontend/dist
 ↓
探す場所: frontend/frontend/dist  （存在しない）
```

`pnpm build` が書き出すのは `frontend/dist`、つまり Root から見ると **`dist`** である。

| 項目 | 設定 |
|---|---|
| Root Directory | `frontend` |
| Build Command | Override OFF（または `pnpm build`） |
| Output Directory | Override OFF、もしくは `dist` |
| Install Command | Override OFF |

Output Directory を `frontend/dist` にすると、成果物が見つからず Deploy が失敗する。ログが `tsc -b && vite build` の直後で切れている場合も、この設定ミスを疑う。

## 3.2 Environment Variables

Vercel の Environment Variable に設定する。Build 時に埋め込まれる。

Production と Preview の両方に入れる。

```text
VITE_API_BASE_URL=https://<backend-host>
```

例：

```text
VITE_API_BASE_URL=https://colorfit-api.onrender.com
```

末尾の `/` は不要。

## 3.3 Deploy手順

1. Vercel で GitHub Repository を Import する
2. Root Directory を `frontend` にする
3. Output Directory は Override OFF、または `dist` にする（`frontend/dist` にはしない）
4. `VITE_API_BASE_URL` を Production / Preview に設定する
5. Deploy する
6. 発行された Frontend Origin を控える（Backend の `CORS_ORIGINS` に使う）

---

# 4. Backend（Render）

- Runtime: Docker（`backend/Dockerfile`）
- Blueprint: リポジトリ直下の `render.yaml`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check: `GET /health` および `HEAD /health`

`GET /` は Backend にトップページが無いため 404 になる。稼働確認は `GET /health` を使う。

## 4.1 Environment Variables

Render Dashboard または Blueprint で設定する。

必須：

```text
APP_ENV=production
CORS_ORIGINS=https://<frontend-host>
STORAGE_BACKEND=r2
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=<bucket-name>
```

`R2_PUBLIC_BASE_URL` は空でよい。ColorFit は Frontend から R2 に直接アクセスしない。

任意（既定値あり）：

```text
LOG_LEVEL=INFO
MAX_UPLOAD_SIZE=10485760
MAX_IMAGE_WIDTH=512
MAX_IMAGE_HEIGHT=512
MAX_PIXEL_COUNT=262144
IMAGE_TTL_HOURS=24
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_UPLOAD=30
RATE_LIMIT_PROCESS=20
RATE_LIMIT_DOWNLOAD=60
```

`CORS_ORIGINS` に `*` は使わない。Frontend Origin のみをカンマ区切りで指定する。

Production 起動時、`CORS_ORIGINS` が空、または `STORAGE_BACKEND=r2` なのに R2 設定が欠けている場合は起動に失敗する。

## 4.2 無料枠と画像サイズ

Render の無料枠はメモリ 512MB である。Color Matching は画素をチャンク分割して処理する。

あわせて、画像の最大寸法は **512 × 512px**（総画素 262,144）とする。これ以上の画像は Upload 時に拒否する。

開発中の `localhost` は `STORAGE_BACKEND=local` のままでよい。R2 が必要なのは Render の Production 側だけである。

## 4.3 Deploy手順

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

ホーム画面には Bucket 一覧は出ない。左メニューから開く。

## 5.1 R2 を開く

1. 左の **Storage & databases**
2. **R2 Object Storage**
3. **Overview**

「Subscribe」や「Get started」が出たら、無料枠で有効化して進む。

## 5.2 Bucket を作る

1. **Create bucket**
2. 名前は例: `colorfit`
3. Location はデフォルトで問題ない
4. **Public access はオフ**のまま（画像は Backend API 経由だけ）

これで `R2_BUCKET_NAME` は Bucket 名そのものである。

## 5.3 API Token を発行する

Bucket 画面ではなく、R2 の **Manage R2 API Tokens**（Overview 右上付近、または **Account API Tokens**）から作る。

1. **Create API token**
2. 権限は **Object Read & Write**
3. 対象 Bucket を `colorfit` に限定できるなら限定する
4. 作成後に表示される次を控える（Secret は再表示されない）

```text
Access Key ID      → R2_ACCESS_KEY_ID
Secret Access Key  → R2_SECRET_ACCESS_KEY
```

## 5.4 Render に入れる値

Endpoint は次の形式である。Account ID はダッシュボード URL の `dash.cloudflare.com/` の直後である。

```text
STORAGE_BACKEND=r2
R2_BUCKET_NAME=colorfit
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<発行した Access Key ID>
R2_SECRET_ACCESS_KEY=<発行した Secret Access Key>
```

`R2_PUBLIC_BASE_URL` は空で構わない。

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
- [x] Vercel の Output Directory は Root からの `dist` である
- [x] 画像最大寸法は 512 × 512px である
- [x] Color Matching はチャンク分割でメモリを抑える
- [x] Vercel / Render / R2 への実 Deploy 手順が実機で確認済みである
