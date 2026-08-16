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
