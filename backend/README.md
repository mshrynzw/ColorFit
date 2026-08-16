# ColorFit Backend

ColorFit の Backend API です。Python / FastAPI で構成しています。

## 必要環境

- Python 3.10 以上
- uv

## セットアップ

```bash
uv sync --all-groups
```

環境変数は `.env.example` をコピーして用意します。

```bash
cp .env.example .env
```

## 起動

```bash
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API は `http://localhost:8000` で起動します。

- Health Check: `GET /health`
- OpenAPI UI: `http://localhost:8000/docs`

Development の画像保存先は `STORAGE_BACKEND=local`（既定）で、`STORAGE_LOCAL_PATH` 配下に置きます。Production では `STORAGE_BACKEND=r2` を使用します。

画像 API：

```text
POST   /api/images
POST   /api/images/{imageId}/process
GET    /api/images/{imageId}
GET    /api/images/{imageId}/result
GET    /api/images/{imageId}/download
DELETE /api/images/{imageId}
```

存在しないパスは統一 Error Response を返します。

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません。",
    "requestId": "..."
  }
}
```

## テスト

```bash
uv run pytest
```

## Production

Production では `APP_ENV=production` と `STORAGE_BACKEND=r2` を使用します。起動方法と Environment Variables は `docs/10_deployment.md` を参照してください。

Health Check: `GET /health` / `HEAD /health`

