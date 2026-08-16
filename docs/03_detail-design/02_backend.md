# ColorFit Backend 詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitのBackendに関する詳細設計を定義するものである。

`product.md`、`01_requirements.md`、`02_basic-design.md` および `03_detail-design/01_frontend.md` で定義された要件・基本設計をもとに、Python + FastAPIによるBackendの構成、責務、レイヤー構造、API処理、画像処理との連携、Storageとの連携、バリデーション、エラー処理、セキュリティなどを定義する。

本書ではBackend全体の実装構造を定義する。

具体的な画像処理アルゴリズムについては、

```text
03_detail-design/03_image-processing.md
03_detail-design/04_color-matching.md
```

で定義する。

APIの詳細なRequest / Response仕様については、

```text
06_api.md
```

で定義する。

---

# 2. Backendの基本方針

ColorFit BackendはPythonおよびFastAPIを使用して構築する。

Backendの主な責務は以下とする。

- API提供
- リクエスト検証
- ファイル検証
- 画像解析
- カラー分析
- カラーマッチング
- 画像変換
- 結果画像生成
- Storage連携
- エラー処理
- 処理状態の管理

FrontendはUIとユーザー操作を担当し、画像処理の主要ロジックはBackendで実行する。

---

# 3. 技術スタック

| 分類                 | 技術          | 用途                   |
| -------------------- | ------------- | ---------------------- |
| Language             | Python        | Backend開発            |
| Web Framework        | FastAPI       | REST API               |
| Validation           | Pydantic      | Request / Response検証 |
| Image Processing     | Pillow        | 画像読み込み・変換     |
| Numerical Processing | NumPy         | 画像データ処理         |
| Storage              | Cloudflare R2 | 画像保存               |
| Testing              | Pytest        | Backendテスト          |
| API Documentation    | OpenAPI       | API仕様                |
| Server               | Uvicorn       | ASGIサーバー           |

必要に応じて追加ライブラリを導入する。

ただし、ライブラリ追加は目的を明確にしたうえで行う。

---

# 4. Backendアーキテクチャ

Backendは責務を分離したレイヤー構造を採用する。

基本構成：

```text
HTTP Request
     ↓
   Router
     ↓
  Schema
     ↓
  Service
     ↓
 ┌───┴──────────────┐
 ↓                  ↓
Image Processing   Storage
 ↓
Pillow / NumPy
```

基本的には以下の責務に分ける。

```text
Router
  ↓
HTTP/API処理

Schema
  ↓
入力・出力データ定義

Service
  ↓
アプリケーションロジック

Image Processing
  ↓
画像解析・画像変換

Storage
  ↓
画像保存・取得・削除
```

---

# 5. ディレクトリ構成

Backendはリポジトリ内の `backend/` に配置する。

基本構成：

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       ├── health.py
│   │       ├── images.py
│   │       └── exports.py
│   │
│   ├── schemas/
│   │   ├── common.py
│   │   ├── palette.py
│   │   ├── image.py
│   │   ├── adjustment.py
│   │   └── export.py
│   │
│   ├── services/
│   │   ├── image_service.py
│   │   ├── color_service.py
│   │   ├── export_service.py
│   │   └── storage_service.py
│   │
│   ├── image_processing/
│   │   ├── analyzer.py
│   │   ├── matcher.py
│   │   ├── transformer.py
│   │   └── presets.py
│   │
│   ├── processing/
│   │   ├── color_space.py
│   │   ├── matcher.py
│   │   └── validation.py
│   │
│   ├── storage/
│   │   ├── base.py
│   │   ├── factory.py
│   │   ├── keys.py
│   │   ├── local.py
│   │   └── r2.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   │
│   └── utils/
│       ├── filenames.py
│       └── image_validation.py
│
├── tests/
├── pyproject.toml
└── README.md
```

実装状況に応じてディレクトリは調整する。

---

# 6. `main.py`

`main.py` はFastAPIアプリケーションのエントリーポイントとする。

主な責務：

- FastAPI Application生成
- Middleware設定
- CORS設定
- Router登録
- Exception Handler登録
- 起動時設定

具体的な画像処理ロジックは配置しない。

---

# 7. API Router

API RouterはHTTPリクエストを受け取り、Serviceへ処理を委譲する。

Routerでは以下を担当する。

- HTTP Method
- Path
- Request受け取り
- Schemaによる入力検証
- Service呼び出し
- Response返却
- HTTP Status Code

Routerに画像処理の詳細なロジックを記述しない。

悪い例：

```python
@router.post("/transform")
def transform(...):
    # ここで大量の画像処理を行う
    ...
```

基本的には、

```text
Router
  ↓
Service
  ↓
Image Processing
```

とする。

---

# 8. API Versioning

APIにはVersionを付与する。

MVPでは、

```text
/api/v1/
```

を基本とする。

例：

```text
/api/v1/health
/api/v1/images
/api/v1/images/analyze
/api/v1/images/transform
/api/v1/exports
```

将来的に破壊的変更が必要になった場合、

```text
/api/v2/
```

を追加できる構造とする。

---

# 9. Health Check

Backendの稼働確認用としてHealth Check APIを提供する。

```text
GET /api/v1/health
```

基本的な用途：

- RenderのHealth Check
- 稼働確認
- 監視
- 開発時の動作確認

レスポンスはBackendが正常に稼働していることを簡潔に示すものとする。

---

# 10. Image API

画像に関する処理はImage APIとして提供する。

想定する責務：

```text
画像アップロード
画像解析
画像変換
画像取得
画像削除
```

具体的なエンドポイントは `06_api.md` で定義する。

---

# 11. 画像処理APIの基本フロー

基本的な画像処理は以下とする。

```text
Frontend
   │
   │ Image + Palette
   ↓
FastAPI
   │
   ├── File Validation
   │
   ├── Request Validation
   │
   ↓
Image Service
   │
   ↓
Image Analyzer
   │
   ↓
Color Matcher
   │
   ↓
Image Transformer
   │
   ↓
Storage
   │
   ↓
Response
   │
   ↓
Frontend
```

---

# 12. Schema

Request / Responseのデータ構造はPydanticを使用して定義する。

基本的なSchema：

```text
Palette
PaletteRatio
Adjustment
ImageMetadata
ImageAnalysis
TransformRequest
TransformResponse
ExportRequest
ExportResponse
ErrorResponse
```

SchemaはAPIとの境界に配置する。

---

# 13. Palette Schema

概念的には以下の構造とする。

```python
class Palette(BaseModel):
    primary: str
    secondary: str
    accent: str
```

カラーコードはBackendでも検証する。

Frontendのバリデーションを信頼してはいけない。

---

# 14. Palette Ratio Schema

```python
class PaletteRatio(BaseModel):
    primary: float
    secondary: float
    accent: float
```

配色比率の合計が100%になることを検証する。

```text
primary
+
secondary
+
accent
=
100
```

許容する小数点以下の桁数や丸め処理は実装時に決定する。

---

# 15. Adjustment Schema

画像調整値は以下を基本とする。

```python
class Adjustment(BaseModel):
    temperature: float
    saturation: float
    brightness: float
    contrast: float
    hue: float
```

各値の具体的な最小値・最大値は、

```text
03_detail-design/03_image-processing.md
```

で定義する。

---

# 16. Image Metadata

画像情報として以下を扱う。

```text
ImageMetadata
├── id
├── filename
├── format
├── width
├── height
└── size
```

必要に応じて、

- MIME Type
- Color Mode
- EXIF情報

などを扱う。

---

# 17. ファイルアップロード

画像ファイルはMultipart形式で受け取ることを基本とする。

Backendでは受信したファイルについて検証を行う。

検証項目：

- MIME Type
- ファイル拡張子
- ファイルサイズ
- 画像として正常に読み込めるか
- 対応画像形式か

---

# 18. ファイル検証

BackendではFrontendから送られたファイルを信用しない。

以下を検証する。

```text
Request
  ↓
MIME Type確認
  ↓
拡張子確認
  ↓
ファイルサイズ確認
  ↓
画像デコード
  ↓
画像形式確認
  ↓
OK
```

拡張子だけを確認して処理を許可しない。

---

# 19. 対応画像形式

MVPでは以下を対応する。

```text
JPEG
PNG
WebP
```

対応形式を増やす場合は、画像処理ライブラリの対応状況とセキュリティを確認する。

---

# 20. ファイルサイズ制限

アップロード可能な最大ファイルサイズをBackend側で制限する。

具体的なサイズは、

```text
03_detail-design/03_image-processing.md
```

で決定する。

Frontendでも同じ制限を表示するが、Backend側の制限を最終的な基準とする。

---

# 21. 画像解析

画像解析はImage Processing Layerで実行する。

基本的な処理：

```text
画像
 ↓
読み込み
 ↓
画像情報取得
 ↓
色分布解析
 ↓
主要カラー抽出
 ↓
解析結果
```

具体的な解析方法は、

```text
03_detail-design/03_image-processing.md
```

で定義する。

---

# 22. Color Matching

Color MatchingはColorFitのコアロジックとする。

基本的な流れ：

```text
Webデザイン配色
       ↓
Palette解析
       ↓
画像解析
       ↓
色分布比較
       ↓
調整量算出
       ↓
Image Transformer
       ↓
調整済み画像
```

具体的なアルゴリズムは、

```text
03_detail-design/04_color-matching.md
```

で定義する。

---

# 23. Image Processing Layer

画像処理は専用モジュールへ分離する。

基本構成：

```text
image_processing/
├── analyzer.py
├── matcher.py
├── transformer.py
└── presets.py
```

---

## 23.1 `analyzer.py`

画像の解析を担当する。

例：

- 画像サイズ
- 色分布
- 主要カラー
- 明度
- 彩度
- その他の画像特徴

---

## 23.2 `matcher.py`

Webデザインの配色と画像の色を比較し、調整に必要な情報を算出する。

```text
Palette
+
Image Analysis
↓
Matching Result
```

---

## 23.3 `transformer.py`

算出された調整値を画像へ適用する。

例：

- 色温度
- 色相
- 彩度
- 明るさ
- コントラスト

---

## 23.4 `presets.py`

プリセットを管理する。

MVPでは以下を提供する。

```text
natural
cool
warm
chic
soft
```

プリセットの具体的なパラメータは画像処理詳細設計で定義する。

---

# 24. Service Layer

Service Layerはアプリケーションのユースケースを担当する。

基本的なService：

```text
ImageService
ColorService
ExportService
StorageService
```

---

# 25. ImageService

ImageServiceは画像関連のユースケースを担当する。

例：

```text
upload()
analyze()
transform()
```

基本的な処理：

```text
ImageService
    ↓
Validation
    ↓
Image Analyzer
    ↓
Color Matcher
    ↓
Image Transformer
    ↓
Storage
```

---

# 26. ColorService

ColorServiceはColorFitの色関連処理を担当する。

例：

- Palette検証
- 配色比率検証
- Color Matching
- 色調整値算出

ただし、実際の画像変換はImage Processing Layerへ委譲する。

---

# 27. ExportService

ExportServiceは画像書き出し処理を担当する。

基本的な処理：

```text
Processed Image
       ↓
Export Settings
       ↓
Format Conversion
       ↓
Quality Setting
       ↓
Output Image
```

対応形式：

```text
WebP
JPEG
PNG
```

---

# 28. StorageService

StorageServiceは画像保存・取得・削除を抽象化する。

Service Layerから直接Cloudflare R2 SDKへアクセスしない。

基本構成：

```text
ImageService
     ↓
StorageService
     ↓
R2 Adapter
     ↓
Cloudflare R2
```

これにより将来的にStorageを変更しやすくする。

---

# 29. Storage Interface

Storageは抽象化して扱う。

概念的には、

```python
class Storage:
    def upload(...):
        ...

    def download(...):
        ...

    def delete(...):
        ...
```

のような責務を持つ。

実際のInterface設計は実装時に決定する。

---

# 30. Cloudflare R2

MVPではCloudflare R2をStorageとして使用する。

用途：

- Original Image
- Processed Image
- Export Image

ただし、不要なデータを長期間保存しない。

保存期間と削除方式は、

```text
03_detail-design/05_storage.md
```

で定義する。

---

# 31. R2へのアクセス

FrontendからR2へ直接アクセスする方式は、MVPでは基本としない。

基本的には、

```text
Frontend
   ↓
FastAPI
   ↓
StorageService
   ↓
Cloudflare R2
```

とする。

将来的に大容量ファイルのアップロードなどで必要になった場合は、Presigned URL方式などを検討する。

---

# 32. 一時ファイル

画像処理中に一時ファイルが必要になった場合、処理完了後に不要なファイルを削除する。

基本方針：

```text
Upload
 ↓
Temporary Processing
 ↓
Output
 ↓
Cleanup
```

異常終了時にも可能な限り不要な一時データを残さない。

---

# 33. エラーハンドリング

Backendでは例外を適切に分類する。

基本分類：

```text
Validation Error
File Error
Image Processing Error
Storage Error
External Service Error
Internal Server Error
```

---

# 34. HTTP Status Code

基本的に以下を使用する。

| Status | 用途                                |
| ------ | ----------------------------------- |
| 200    | 正常処理                            |
| 201    | リソース作成                        |
| 400    | 不正なリクエスト                    |
| 404    | リソースが存在しない                |
| 413    | ファイルサイズ超過                  |
| 422    | 入力値・画像内容の検証失敗          |
| 429    | Rate Limit超過                      |
| 500    | Backend内部エラー                   |
| 503    | 外部サービス・Backendが利用できない |

具体的なAPIごとのStatus Codeは `06_api.md` で確定する。

---

# 35. Error Response

Frontendが扱いやすいよう、エラーレスポンス形式を統一する。

概念例：

```json
{
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "画像サイズが大きすぎます。",
    "details": null
  }
}
```

`message` はユーザーに表示可能な内容とする。

内部のStack Traceや機密情報はレスポンスへ含めない。

---

# 36. Exception Handler

FastAPIのException Handlerを利用して、Backend内部の例外をHTTPレスポンスへ変換する。

基本的な流れ：

```text
Exception
   ↓
Exception Handler
   ↓
Error Code
   ↓
HTTP Response
```

Routerごとに個別のException Responseを作りすぎない。

---

# 37. Logging

Backendではログを適切に記録する。

ログ対象：

- API Request
- 処理開始
- 処理完了
- 処理時間
- エラー
- Storage操作
- 画像処理失敗

ただし、以下はログへ出力しない。

- ユーザーの画像そのもの
- API Secret
- Access Token
- その他の秘密情報

---

# 38. Request ID

必要に応じて各RequestにRequest IDを付与する。

目的：

```text
Frontend
 ↓
Request ID
 ↓
Backend
 ↓
Log
```

とすることで、エラー発生時に処理を追跡しやすくする。

MVPでは必須とせず、ログ設計時に導入可否を判断する。

---

# 39. CORS

FrontendとBackendが別Originとなるため、CORSを設定する。

Development：

```text
http://localhost:5173
```

Production：

```text
https://<frontend-domain>
```

許可Originは環境変数などで管理し、`*` を本番環境で無制限に許可しない。

---

# 40. Configuration

Backendの環境依存設定は環境変数で管理する。

例：

```text
APP_ENV
CORS_ORIGINS
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
MAX_UPLOAD_SIZE
```

秘密情報はGitへコミットしない。

---

# 41. Environment

基本的に以下の環境を想定する。

```text
Development
Staging / Preview
Production
```

環境ごとに以下を分離する。

- API URL
- CORS
- R2 Bucket
- Log Level
- Debug設定

---

# 42. Dependency Injection

FastAPIのDependency Injectionを必要に応じて利用する。

対象：

- Configuration
- Storage
- Service
- 認証機能（将来）
- Request Context

ただし、すべてをDependencyにするのではなく、責務が明確になる場合に使用する。

---

# 43. Backendのレイヤー依存関係

基本的な依存方向：

```text
API Router
    ↓
Service
    ↓
Image Processing / Storage
```

SchemaはAPI境界で使用する。

Infrastructureの実装詳細をRouterから直接参照しない。

---

# 44. 禁止する依存関係

以下のような構造を避ける。

```text
Router
 ↓
R2 SDK
```

また、

```text
Router
 ↓
Pillow
 ↓
大量の画像処理
```

も避ける。

基本的に、

```text
Router
 ↓
Service
 ↓
専用処理
```

とする。

---

# 45. 非同期処理

FastAPIではI/O処理に対して適切に非同期処理を使用する。

ただし、Pillow / NumPyによるCPU負荷の高い処理をすべて無条件にasync関数へすることは避ける。

画像処理の実行方式については、処理時間とRenderのリソース制限を考慮して決定する。

長時間処理が必要になった場合は、将来的にJob Queue / Background Workerの導入を検討する。

---

# 46. 画像処理時間

画像処理は画像サイズによって処理時間が変化する。

そのため、Backendでは処理時間を計測できるようにする。

基本的に以下を記録する。

```text
処理開始時刻
処理終了時刻
処理時間
画像サイズ
処理結果
```

画像そのものはログへ保存しない。

---

# 47. Rate Limit

画像処理はBackendリソースを消費するため、Rate Limitを考慮する。

MVPでは最低限、

- 短時間の大量リクエスト
- 同一処理の連続実行
- 大量ファイルアップロード

への対策を検討する。

具体的なRate Limit値は運用環境のリソースを確認したうえで決定する。

---

# 48. Resource Limit

以下のリソースを制限する。

- 最大ファイルサイズ
- 最大画像解像度
- 1回の処理で使用するメモリ
- 同時処理数
- Request Timeout

具体的な値は画像処理詳細設計とDeployment設計で決定する。

---

# 49. Timeout

以下の処理についてTimeoutを考慮する。

- API Request
- Storageアクセス
- 画像処理
- 外部サービスアクセス

長時間処理が発生した場合、Frontendへ適切なエラーを返す。

---

# 50. APIとServiceの責務

例えば画像変換の場合：

```text
POST /api/v1/images/transform
            ↓
        ImageRouter
            ↓
        ImageService
            ↓
      ImageAnalyzer
            ↓
       ColorMatcher
            ↓
      ImageTransformer
            ↓
       StorageService
            ↓
        Response
```

各層の責務を明確にする。

---

# 51. API Responseの考え方

API ResponseにはFrontendが必要とする情報だけを返す。

例えば画像処理結果：

```text
imageId
originalImage
processedImage
analysis
adjustment
```

など。

Backend内部で使用している中間データをすべてFrontendへ返さない。

---

# 52. API仕様との整合性

BackendのSchema、Router、Service、Frontend API Clientは、

```text
docs/06_api.md
```

に定義されたAPI仕様と一致させる。

API仕様を変更する場合は、以下を確認する。

```text
API Documentation
↓
Backend Schema
↓
Backend Router
↓
Frontend Type
↓
Frontend API Client
↓
Frontend UI
```

---

# 53. Testing

BackendではPytestを使用する。

## Unit Test

対象：

- Palette validation
- Ratio validation
- Color calculation
- Image utility
- Preset
- File validation

## Integration Test

対象：

- API
- Service
- Image Processing
- Storage

## E2E / API Test

主要フロー：

```text
画像アップロード
 ↓
解析
 ↓
カラー調整
 ↓
結果取得
 ↓
書き出し
```

---

# 54. Image Processing Test

画像処理については、単にHTTP Status Codeだけをテストしない。

以下も確認する。

- 出力画像が生成される
- 画像サイズが意図せず変わらない
- 対応形式で出力される
- Alpha Channelが必要な場合に維持される
- 極端な入力でもエラーにならない
- 色調整が期待した方向へ作用する

具体的なテストケースは、

```text
03_detail-design/03_image-processing.md
```

で定義する。

---

# 55. Color Matching Test

Color MatchingはColorFitのコアロジックであるため、単体テストを重視する。

例えば、

```text
入力Palette
+
入力画像
↓
Matching Result
```

が期待した結果になることを確認する。

具体的なテストケースは、

```text
03_detail-design/04_color-matching.md
```

で定義する。

---

# 56. Security Test

以下をテスト対象とする。

- 不正なファイル形式
- MIME Type偽装
- サイズ超過
- 壊れた画像
- 想定外の入力値
- 不正なAPI Request
- Rate Limit
- CORS
- Storageアクセス

---

# 57. API Documentation

FastAPIが生成するOpenAPI仕様を利用する。

Development環境ではSwagger UIなどを利用してAPIを確認できるようにする。

Production環境でのAPI Documentation公開については、セキュリティと運用方針を考慮して決定する。

---

# 58. BackendとFrontendの責務境界

| 処理             | Frontend | Backend |
| ---------------- | -------: | ------: |
| UI               |        ○ |       - |
| フォーム入力     |        ○ |       - |
| HEX入力検証      |        ○ |       ○ |
| 配色比率入力     |        ○ |       ○ |
| ファイル選択     |        ○ |       - |
| ファイル基本検証 |        ○ |       ○ |
| 画像プレビュー   |        ○ |       - |
| 画像解析         |        - |       ○ |
| Color Matching   |        - |       ○ |
| 最終画像処理     |        - |       ○ |
| API通信          |        ○ |       - |
| R2操作           |        - |       ○ |
| 書き出し画像生成 |        - |       ○ |
| ダウンロード開始 |        ○ |       ○ |

Frontendの検証結果をBackendでは信用しない。

---

# 59. 将来の認証

MVPではユーザー認証を実装しない。

将来的にユーザーアカウントを導入する場合は、

```text
Authentication
Authorization
User ID
Project ID
```

などを追加する。

その際には、画像へのアクセス制御も必要となる。

---

# 60. 将来のJob Queue

画像処理が大規模化した場合、同期APIだけでは処理時間やリソースに限界が発生する可能性がある。

その場合、

```text
Frontend
 ↓
FastAPI
 ↓
Job Queue
 ↓
Worker
 ↓
Image Processing
 ↓
R2
```

という構成を検討する。

MVPでは、まず同期処理を基本とする。

---

# 61. 将来のデータベース

MVPではDatabaseを使用しない。

将来的に以下を実装する場合、Database導入を検討する。

- ユーザー
- プロジェクト
- 画像履歴
- 配色保存
- 調整履歴
- ユーザー設定

Database設計は `05_database.md` で定義する。

---

# 62. Backend実装原則

Backend実装では以下を原則とする。

1. Pythonを使用する。
2. FastAPIを使用する。
3. Routerにビジネスロジックを集中させない。
4. SchemaをAPI境界に使用する。
5. Serviceへユースケースを分離する。
6. 画像処理ロジックを専用Moduleへ分離する。
7. Storageアクセスを抽象化する。
8. Frontendからの入力を信用しない。
9. すべての外部入力を検証する。
10. エラー形式を統一する。
11. 秘密情報をログへ出力しない。
12. 画像を不要に長期間保存しない。
13. CPU負荷の高い画像処理を考慮する。
14. 新機能にはテストを追加する。
15. API仕様と実装の整合性を維持する。

---

# 63. 実装時の優先順位

Backend実装は以下の順序を基本とする。

```text
1. FastAPI基本構成
        ↓
2. Health Check
        ↓
3. Schema
        ↓
4. File Validation
        ↓
5. Image Upload
        ↓
6. Image Analysis
        ↓
7. Color Matching
        ↓
8. Image Transformation
        ↓
9. Storage
        ↓
10. Export
        ↓
11. Error Handling
        ↓
12. Security
        ↓
13. Testing
```

ただし、実装上必要な部分については前後する場合がある。

---

# 64. 完了条件

Backend詳細設計は以下を満たすことを完了条件とする。

- [ ] Backend技術スタックが定義されている
- [ ] Backendの責務が定義されている
- [ ] レイヤー構造が定義されている
- [ ] ディレクトリ構成が定義されている
- [ ] API Routerの責務が定義されている
- [ ] Schemaの役割が定義されている
- [ ] Serviceの役割が定義されている
- [ ] Image Processing Layerが定義されている
- [ ] Storage Layerが定義されている
- [ ] R2との連携方針が定義されている
- [ ] ファイル検証方針が定義されている
- [ ] エラー処理方針が定義されている
- [ ] Logging方針が定義されている
- [ ] CORS方針が定義されている
- [ ] Environment Variablesの方針が定義されている
- [ ] Rate Limitの方針が定義されている
- [ ] Resource Limitの方針が定義されている
- [ ] Testing方針が定義されている
- [ ] Frontendとの責務境界が明確になっている
- [ ] Image Processing詳細設計へ引き渡す内容が明確になっている
- [ ] API設計へ引き渡す内容が明確になっている
