# ColorFit API設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるFrontendとBackend間のAPI仕様を定義する。

対象：

- API Endpoint
- HTTP Method
- Request
- Response
- Error Response
- Status Code
- Validation
- Processing Flow
- Storage Flow
- Security
- Rate Limit

BackendはPython / FastAPIを使用する。

FrontendはReact Router / TypeScriptを使用し、本APIを介してBackendと通信する。

---

# 2. API基本方針

ColorFit APIでは以下を基本方針とする。

1. REST APIを基本とする。
2. HTTPS通信を使用する。
3. BackendはFastAPIで実装する。
4. FrontendからR2へ直接アクセスしない。
5. FrontendからDatabaseへ直接アクセスしない。
6. RequestはBackendで必ずValidationする。
7. Error Responseの形式を統一する。
8. Request IDを利用してRequestを追跡できるようにする。
9. User Inputを信頼しない。
10. API Responseに内部Exceptionを直接返さない。
11. File Uploadにはサイズ・形式・内容のValidationを行う。
12. Color設定にもValidationを行う。
13. Processing APIではImage ProcessingとColor MatchingをBackendで実行する。
14. MVPでは基本的にSynchronous Processingを採用する。
15. 将来的なAsynchronous Processingへの移行を考慮する。

---

# 3. API Base URL

環境ごとにAPI Base URLを変更する。

## Development

```text
http://localhost:8000
```

## Test

```text
Test EnvironmentのBackend URL
```

## Production

```text
Production Backend URL
```

FrontendではEnvironment Variableから取得する。

例：

```text
VITE_API_BASE_URL
```

実際のEnvironment Variable名はFrontend実装に合わせる。

---

# 4. API Version

MVPでは以下を基本とする。

```text
/api
```

将来的にBreaking Changeが発生した場合、

```text
/api/v1
```

などのVersioningを導入する。

---

# 5. API Endpoint一覧

MVPでは以下のEndpointを基本とする。

| Method | Endpoint                         | Description        |
| ------ | -------------------------------- | ------------------ |
| POST   | `/api/images`                    | 画像Upload         |
| GET    | `/api/images/{imageId}`          | 画像情報取得       |
| POST   | `/api/images/{imageId}/process`  | Color Matching実行 |
| GET    | `/api/images/{imageId}/result`   | 処理結果取得       |
| GET    | `/api/images/{imageId}/download` | 結果画像Download   |
| DELETE | `/api/images/{imageId}`          | 画像削除           |

---

# 6. API全体Flow

```text
Frontend
   │
   │ POST /api/images
   ↓
Backend
   │
   ↓
Image Validation
   │
   ↓
R2
   │
   ↓
imageId
   │
   │
   │ POST /api/images/{imageId}/process
   ↓
Backend
   │
   ↓
Image Processing
   │
   ↓
Color Matching
   │
   ↓
R2
   │
   ↓
Result
   │
   │ GET /api/images/{imageId}/result
   ↓
Frontend
   │
   ↓
Result Page
```

---

# 7. Request ID

すべてのAPI RequestにRequest IDを設定する。

目的：

- Error追跡
- Log検索
- Debug
- Support
- Performance分析

---

# 8. Request ID Header

ClientからRequest IDを送信する場合：

```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

Clientが指定しない場合、Backend側で生成する。

---

# 9. Response Header

Responseには可能な限りRequest IDを含める。

```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

# 10. Content-Type

JSON APIでは、

```http
Content-Type: application/json
```

を使用する。

File Uploadでは、

```http
Content-Type: multipart/form-data
```

を使用する。

---

# 11. Character Encoding

JSON ResponseはUTF-8を使用する。

---

# 12. HTTP Status Code

基本的に以下を使用する。

| Status | Meaning                |
| -----: | ---------------------- |
|    200 | Success                |
|    201 | Created                |
|    204 | Success / No Content   |
|    400 | Bad Request            |
|    401 | Unauthorized           |
|    403 | Forbidden              |
|    404 | Not Found              |
|    413 | Payload Too Large      |
|    415 | Unsupported Media Type |
|    422 | Validation Error       |
|    429 | Too Many Requests      |
|    500 | Internal Server Error  |
|    503 | Service Unavailable    |
|    504 | Gateway Timeout        |

---

# 13. API Error Format

Error Responseは統一する。

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けエラーメッセージ",
    "requestId": "REQUEST_ID"
  }
}
```

---

# 14. Error Code

Error CodeはMachine-readableな値とする。

例：

```text
INVALID_REQUEST
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_IMAGE_FORMAT
IMAGE_DECODE_FAILED
IMAGE_NOT_FOUND
INVALID_COLOR
INVALID_PALETTE
INVALID_RATIO
INVALID_STRENGTH
IMAGE_PROCESSING_FAILED
COLOR_MATCHING_FAILED
PROCESSING_TIMEOUT
STORAGE_UPLOAD_FAILED
STORAGE_DOWNLOAD_FAILED
STORAGE_DELETE_FAILED
STORAGE_TIMEOUT
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
SERVICE_UNAVAILABLE
```

---

# 15. Error Message

`message`はユーザーが理解できる日本語を基本とする。

例：

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "画像サイズが大きすぎます。",
    "requestId": "..."
  }
}
```

---

# 16. Internal Error

Backend内部のExceptionをそのままResponseへ返さない。

悪い例：

```json
{
  "error": "Pillow.UnidentifiedImageError: ..."
}
```

良い例：

```json
{
  "error": {
    "code": "IMAGE_DECODE_FAILED",
    "message": "画像を読み込めませんでした。",
    "requestId": "..."
  }
}
```

---

# 17. Authentication

MVPではAuthenticationを必須としない。

将来的にUser Account機能を追加する場合、

```http
Authorization: Bearer <token>
```

などを導入する。

---

# 18. Authorization

Authentication導入後は、Resource Ownerを確認する。

例：

```text
User A
 ↓
Image A
```

は許可。

```text
User A
 ↓
Image B
 ↓
User BのImage
```

は拒否する。

---

# 19. CORS

FrontendのOriginのみを許可する。

Development：

```text
http://localhost:5173
```

Production：

```text
Production Frontend Origin
```

具体的なOriginはEnvironment Variableで管理する。

---

# 20. Rate Limit

APIにはRate Limitを設定する。

特に以下を重点的に制限する。

```text
POST /api/images
POST /api/images/{imageId}/process
GET /api/images/{imageId}/download
```

---

# 21. Rate Limit Error

Rate Limit超過時：

```http
HTTP/1.1 429 Too Many Requests
```

Response：

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト回数が多すぎます。しばらくしてから再度お試しください。",
    "requestId": "..."
  }
}
```

---

# 22. POST /api/images

画像をUploadする。

---

# 23. Upload Request

HTTP：

```http
POST /api/images
Content-Type: multipart/form-data
```

Form Field：

```text
file
```

---

# 24. Upload Request Example

概念：

```text
file = example.jpg
```

FrontendではFormDataを利用する。

---

# 25. Upload Validation

Backendでは以下をValidationする。

```text
File存在
File Size
MIME Type
File Signature
Image Format
Image Decode
Width
Height
Pixel Count
```

---

# 26. Supported Image Format

MVPでは基本的に以下を対象とする。

```text
JPEG
PNG
WebP
```

最終的な対応形式はImage Processing設計に従う。

---

# 27. Upload File Size

最大File SizeをBackendで制限する。

例：

```text
MAX_FILE_SIZE
```

具体的な値はEnvironment Configurationで管理する。

---

# 28. Upload Dimension

画像のWidth / HeightをValidationする。

```text
MAX_WIDTH
MAX_HEIGHT
```

---

# 29. Upload Pixel Count

巨大画像によるMemory Attackを防ぐため、総Pixel数を制限する。

```text
MAX_PIXEL_COUNT
```

---

# 30. Upload Success Response

HTTP：

```http
201 Created
```

Response：

```json
{
  "image": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "example.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 1024000,
    "width": 1920,
    "height": 1080
  }
}
```

---

# 31. Image ID

Image IDには推測困難な一意なIDを使用する。

基本的にはUUIDを使用する。

---

# 32. Upload Flow

```text
Frontend
  │
  │ multipart/form-data
  ↓
POST /api/images
  │
  ↓
Request Validation
  │
  ↓
File Validation
  │
  ↓
Image Decode
  │
  ↓
R2 Upload
  │
  ↓
Image ID
  │
  ↓
201 Created
```

---

# 33. Upload Error

### File未指定

```http
400 Bad Request
```

```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "画像ファイルを指定してください。",
    "requestId": "..."
  }
}
```

---

# 34. File Size Error

```http
413 Payload Too Large
```

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "画像サイズが大きすぎます。",
    "requestId": "..."
  }
}
```

---

# 35. Unsupported Format Error

```http
415 Unsupported Media Type
```

```json
{
  "error": {
    "code": "UNSUPPORTED_IMAGE_FORMAT",
    "message": "対応していない画像形式です。",
    "requestId": "..."
  }
}
```

---

# 36. Image Decode Error

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "IMAGE_DECODE_FAILED",
    "message": "画像を読み込めませんでした。",
    "requestId": "..."
  }
}
```

---

# 36.1. Image Dimensions Error

幅・高さ、または総Pixel数が上限を超えた場合：

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "IMAGE_DIMENSIONS_TOO_LARGE",
    "message": "画像の幅または高さが大きすぎます。",
    "requestId": "..."
  }
}
```

上限は Environment Configuration で管理する。MVP の既定値は次のとおり。

```text
MAX_IMAGE_WIDTH=512
MAX_IMAGE_HEIGHT=512
MAX_PIXEL_COUNT=262144
```

---

# 37. Storage Upload Error

```http
503 Service Unavailable
```

```json
{
  "error": {
    "code": "STORAGE_UPLOAD_FAILED",
    "message": "画像を保存できませんでした。",
    "requestId": "..."
  }
}
```

---

# 38. GET /api/images/{imageId}

画像情報を取得する。

---

# 39. Image Information Request

```http
GET /api/images/{imageId}
```

---

# 40. Image Information Response

```http
200 OK
```

```json
{
  "image": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "example.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 1024000,
    "width": 1920,
    "height": 1080,
    "status": "uploaded"
  }
}
```

---

# 41. Image Status

MVPでは以下を基本とする。

```text
uploaded
processing
completed
failed
```

---

# 42. Image Not Found

```http
404 Not Found
```

```json
{
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "画像が見つかりません。",
    "requestId": "..."
  }
}
```

---

# 43. POST /api/images/{imageId}/process

ImageにColor Matching処理を実行する。

---

# 44. Processing Request

```http
POST /api/images/{imageId}/process
Content-Type: application/json
```

---

# 45. Processing Request Body

基本：

```json
{
  "palette": [
    {
      "name": "primary",
      "color": "#123456",
      "ratio": 60
    },
    {
      "name": "secondary",
      "color": "#789ABC",
      "ratio": 30
    },
    {
      "name": "accent",
      "color": "#FFAA00",
      "ratio": 10
    }
  ],
  "strength": 0.7
}
```

---

# 46. Palette

PaletteはColor Matchingに使用するTarget Colorの集合。

---

# 47. Palette Color

各Colorには以下を指定する。

```text
name
color
ratio
```

---

# 48. Color

ColorはHEX形式を基本とする。

有効：

```text
#FFFFFF
#000000
#123456
```

無効：

```text
FFFFFF
#GGGGGG
#12345
#1234567
```

---

# 49. Ratio

RatioはColorの適用割合を示す。

基本：

```text
0 <= ratio <= 100
```

Palette全体の合計：

```text
SUM(ratio) = 100
```

---

# 50. Strength

Color Matchingの適用強度。

基本：

```text
0 <= strength <= 1
```

例：

```text
0
0.25
0.5
0.75
1
```

---

# 51. Strengthの意味

概念：

```text
0
↓
Color Matchingなし

0.5
↓
中程度

1
↓
最大強度
```

実際のAlgorithm上の意味はColor Matching設計に従う。

---

# 52. Processing Request Validation

Backendでは以下をValidationする。

```text
imageId
palette
color
ratio
strength
```

---

# 53. Invalid Color

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "INVALID_COLOR",
    "message": "カラーコードが正しくありません。",
    "requestId": "..."
  }
}
```

---

# 54. Invalid Palette

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "INVALID_PALETTE",
    "message": "カラーパレットが正しくありません。",
    "requestId": "..."
  }
}
```

---

# 55. Invalid Ratio

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "INVALID_RATIO",
    "message": "配色割合が正しくありません。",
    "requestId": "..."
  }
}
```

---

# 56. Invalid Strength

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "INVALID_STRENGTH",
    "message": "色の適用強度が正しくありません。",
    "requestId": "..."
  }
}
```

---

# 57. Processing Flow

```text
POST /process
      │
      ↓
Image Exists Check
      │
      ↓
Request Validation
      │
      ↓
Palette Validation
      │
      ↓
Download Original
      │
      ↓
Decode
      │
      ↓
Image Analysis
      │
      ↓
Color Matching
      │
      ↓
Image Transformation
      │
      ↓
Encode
      │
      ↓
Output Validation
      │
      ↓
R2 Upload
      │
      ↓
Success Response
```

---

# 58. Processing Success Response

```http
200 OK
```

```json
{
  "result": {
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "resultUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000/result"
  }
}
```

---

# 59. Processing Result

Processing Resultでは、

```text
imageId
status
resultUrl
```

などを返す。

---

# 60. Processing Error

画像処理に失敗した場合：

```http
500 Internal Server Error
```

または原因に応じて適切なStatus Codeを返す。

```json
{
  "error": {
    "code": "IMAGE_PROCESSING_FAILED",
    "message": "画像の処理に失敗しました。",
    "requestId": "..."
  }
}
```

---

# 61. Color Matching Error

```http
500 Internal Server Error
```

```json
{
  "error": {
    "code": "COLOR_MATCHING_FAILED",
    "message": "画像の色合わせに失敗しました。",
    "requestId": "..."
  }
}
```

---

# 62. Processing Timeout

処理時間が設定されたLimitを超えた場合：

```http
504 Gateway Timeout
```

```json
{
  "error": {
    "code": "PROCESSING_TIMEOUT",
    "message": "画像処理に時間がかかりすぎています。",
    "requestId": "..."
  }
}
```

---

# 63. GET /api/images/{imageId}/result

Processing結果を取得する。

---

# 64. Result Request

```http
GET /api/images/{imageId}/result
```

---

# 65. Result Response

```http
200 OK
```

```json
{
  "result": {
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "originalUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000",
    "resultUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000/download",
    "palette": [
      { "name": "primary", "color": "#1E3A5F", "ratio": 60 },
      { "name": "secondary", "color": "#D8B26E", "ratio": 30 },
      { "name": "accent", "color": "#F5F1E8", "ratio": 10 }
    ],
    "strength": 0.7
  }
}
```

---

# 66. Result未完成

Processing中の場合：

```http
200 OK
```

```json
{
  "result": {
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing"
  }
}
```

MVPではSynchronous Processingを基本とするため、通常はProcessing完了後にResponseを返す。

---

# 67. Result Not Found

Resultが存在しない場合：

```http
404 Not Found
```

```json
{
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "処理結果が見つかりません。",
    "requestId": "..."
  }
}
```

必要に応じて専用Error Codeを追加する。

---

# 68. GET /api/images/{imageId}/download

Processed ImageをDownloadする。

Processed Imageがまだ存在しない場合は Original Image を返す。
Phase 4では Image Processing 前のため、Original Image が Download 対象になる。

Before / After 比較のために Original が必要な場合：

```http
GET /api/images/{imageId}/download?source=original
```

`source` の値：

```text
未指定 / auto
↓
Processed があれば Processed、なければ Original

original
↓
常に Original

processed
↓
Processed。未生成なら 404
```

---

# 69. Download Response

```http
200 OK
Content-Type: image/webp
Content-Disposition: attachment; filename="sample.webp"
Cache-Control: private, no-store
```

Processed Image のファイル名は、元画像のファイル名から拡張子を除いた部分に `.webp` を付けたもの。

```text
test.png → test.webp
CHASE!.png → CHASE!.webp
```

元ファイル名が使えない場合は `image.webp` とする。

実際のOutput FormatはImage Processing設計に従う。

---

# 70. Download Flow

```text
Frontend
  │
  │ GET /download
  ↓
Backend
  │
  ↓
Authorization / Validation
  │
  ↓
Storage Service
  │
  ↓
R2
  │
  ↓
Image
  │
  ↓
Frontend
```

---

# 71. Download Error

Storageから取得できない場合：

```http
503 Service Unavailable
```

```json
{
  "error": {
    "code": "STORAGE_DOWNLOAD_FAILED",
    "message": "画像を取得できませんでした。",
    "requestId": "..."
  }
}
```

---

# 72. DELETE /api/images/{imageId}

Imageおよび関連するProcessed Imageを削除する。

---

# 73. Delete Request

```http
DELETE /api/images/{imageId}
```

---

# 74. Delete Success

```http
204 No Content
```

Response Bodyは返さない。

---

# 75. Delete Flow

```text
Frontend
  │
  │ DELETE
  ↓
Backend
  │
  ↓
Image Exists Check
  │
  ↓
Storage Service
  │
  ├── Original Delete
  │
  └── Processed Delete
  │
  ↓
204 No Content
```

---

# 76. Delete Error

```http
503 Service Unavailable
```

```json
{
  "error": {
    "code": "STORAGE_DELETE_FAILED",
    "message": "画像を削除できませんでした。",
    "requestId": "..."
  }
}
```

---

# 77. API Idempotency

DELETEは可能な限りIdempotentにする。

同じResourceを複数回DeleteしてもApplicationが不安定にならないようにする。

---

# 78. Processing Idempotency

同じImageに対して同一条件で複数回Processing Requestを送った場合の挙動を定義する。

MVPでは、

```text
新しいProcessingを実行
```

を基本とする。

将来的にJob IDやIdempotency Keyを導入する。

---

# 79. Idempotency Key

将来的にProcessing APIへ、

```http
Idempotency-Key: <unique-key>
```

を導入することを検討する。

---

# 80. API Request Size

Request BodyおよびUpload Fileのサイズを制限する。

特にFile Uploadでは、

```text
MAX_FILE_SIZE
```

を適用する。

---

# 81. API Timeout

APIにはTimeoutを設定する。

対象：

```text
HTTP Request
R2 Request
Image Processing
```

---

# 82. Storage Timeout

R2へのRequestがTimeoutした場合：

```json
{
  "error": {
    "code": "STORAGE_TIMEOUT",
    "message": "画像ストレージへの接続がタイムアウトしました。",
    "requestId": "..."
  }
}
```

---

# 83. Storage Retry

一時的なStorage Errorについては、Backend内部でRetryを行う。

ただし無限Retryは禁止する。

---

# 84. Retry Policy

概念：

```text
Request
 ↓
Failure
 ↓
Retry 1
 ↓
Failure
 ↓
Retry 2
 ↓
Failure
 ↓
Retry 3
 ↓
Error
```

最大Retry回数はEnvironment Configurationで管理する。

---

# 85. Non-Retryable Error

以下は原則としてRetryしない。

```text
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_IMAGE_FORMAT
INVALID_COLOR
INVALID_PALETTE
INVALID_RATIO
INVALID_STRENGTH
```

---

# 86. Retryable Error

一時的なInfrastructure ErrorについてRetryを検討する。

例：

```text
STORAGE_TIMEOUT
STORAGE_UNAVAILABLE
TEMPORARY_NETWORK_ERROR
```

---

# 87. API Logging

BackendではRequest Logを記録する。

最低限：

```text
timestamp
requestId
method
path
status
processingTime
```

---

# 88. Error Logging

Error発生時：

```text
timestamp
requestId
errorCode
endpoint
status
stack trace
```

などをServer Logへ記録する。

ただし、ユーザー向けResponseにはStack Traceを返さない。

---

# 89. Sensitive Data Logging

以下をLogへ出力しない。

```text
R2 Secret
API Key
Authorization Token
Password
Image Binary
```

---

# 90. Image Filename

Original FilenameはUser Inputとして扱う。

Storage Object Keyへ直接使用しない。

---

# 91. Storage Object Key

Object KeyはBackend側で安全に生成する。

例：

```text
images/{uuid}/original
images/{uuid}/processed
```

---

# 92. Path Traversal対策

以下のような入力をStorage Object Keyへ直接利用しない。

```text
../../file
../secret
..\..\secret
```

---

# 93. API Validation

Validationは2段階で行う。

```text
Frontend Validation
        ↓
Backend Validation
```

Frontend ValidationはUX向上を目的とする。

Backend ValidationをSecurity Boundaryとする。

---

# 94. Frontend Validation

Frontendでは可能な範囲で、

```text
File Size
File Type
Color Format
Ratio
Strength
```

をValidationする。

---

# 95. Backend Validation

Backendでは必ず同じ値を再Validationする。

Frontend Validationを信頼しない。

---

# 96. API Schema

FastAPI / Pydanticを利用してSchemaを定義する。

例：

```python
class PaletteColor(BaseModel):
    name: str
    color: str
    ratio: float
```

---

# 97. Processing Schema

概念：

```python
class ProcessImageRequest(BaseModel):
    palette: list[PaletteColor]
    strength: float
```

実際のValidation RuleはBackend実装に合わせる。

---

# 98. Response Schema

Response SchemaもPydanticなどで定義する。

例：

```text
ImageResponse
ProcessResponse
ResultResponse
ErrorResponse
```

---

# 99. OpenAPI

FastAPIが生成するOpenAPI Schemaを利用する。

DevelopmentではAPI仕様確認のため、

```text
/docs
```

などのOpenAPI UIを利用できる。

Productionでの公開可否はSecurity方針に従う。

---

# 100. API Documentation

API仕様変更時には、

```text
06_api.md
```

とBackendのOpenAPI Schemaが一致するようにする。

---

# 101. API Contract変更

Breaking Changeを行う場合、FrontendとBackendを同時に更新する。

例：

```text
Backend Schema変更
 ↓
Frontend API Client変更
 ↓
Tests変更
 ↓
Documentation変更
```

---

# 102. API Backward Compatibility

MVPではAPIの長期Backward Compatibilityを必須としない。

ただし、Production公開後のBreaking Changeには注意する。

---

# 103. Future Async API

将来的にImage Processingが長時間化した場合、以下のAPIへ拡張する。

```text
POST /api/images/{imageId}/process
```

Response：

```json
{
  "job": {
    "id": "JOB_ID",
    "status": "queued"
  }
}
```

---

# 104. Future Job API

将来的に以下を追加する。

```text
GET /api/jobs/{jobId}
```

---

# 105. Future Job Response

```json
{
  "job": {
    "id": "JOB_ID",
    "status": "processing",
    "progress": 60
  }
}
```

---

# 106. Future Cancel API

必要に応じて、

```text
POST /api/jobs/{jobId}/cancel
```

を追加する。

---

# 107. API Architecture

基本Architecture：

```text
Frontend
   │
   │ HTTPS
   ↓
FastAPI Router
   │
   ↓
Request Validation
   │
   ↓
Application Service
   │
   ├─────────────┐
   ↓             ↓
Processing    Storage
   │             │
   ↓             ↓
Color Match     R2
```

---

# 108. API Router責務

Routerでは以下のみを担当する。

```text
Request受信
Validation
Service呼び出し
Response生成
```

---

# 109. Service責務

Serviceでは、

```text
Business Logic
Image Processing
Color Matching
Storage Coordination
```

などを担当する。

---

# 110. API Client Architecture

Frontend：

```text
Component
    ↓
Custom Hook
    ↓
API Client
    ↓
HTTP
    ↓
FastAPI
```

---

# 111. API Client Error Handling

API ClientではError Responseを共通形式へ変換する。

例：

```text
HTTP 413
 ↓
FILE_TOO_LARGE
 ↓
Frontend Error
 ↓
「画像サイズが大きすぎます。」
```

---

# 112. API Client Retry

Frontend側で無条件にAPI Retryしない。

特に、

```text
POST /process
```

などのRequestは重複Processingに注意する。

---

# 113. API Error UI

FrontendではError Codeに応じてUIを変更する。

例：

```text
FILE_TOO_LARGE
↓
「画像サイズが大きすぎます。」

UNSUPPORTED_IMAGE_FORMAT
↓
「対応していない画像形式です。」

IMAGE_PROCESSING_FAILED
↓
「画像の処理に失敗しました。」
+
「もう一度試す」
```

---

# 114. API Success UI

Success Responseを受け取った場合、

```text
Processing Success
↓
Result Page
```

へ遷移する。

React Routerを利用してNavigationする。

---

# 115. API Loading UI

API Request中はLoading Stateを管理する。

```text
idle
↓
loading
↓
success
```

Error：

```text
loading
↓
error
```

---

# 116. Upload Loading

Upload中：

```text
Uploading...
```

などのUIを表示する。

---

# 117. Processing Loading

Processing中：

```text
Processing...
```

などのUIを表示する。

AnimationはUI Guidelineに従う。

---

# 118. API Accessibility

API Errorだけに頼らず、Frontendでユーザーが理解できるError Messageを表示する。

---

# 119. API Security

以下を必須とする。

- [ ] HTTPS
- [ ] Input Validation
- [ ] File Validation
- [ ] Rate Limit
- [ ] CORS
- [ ] Secret Protection
- [ ] Path Traversal対策
- [ ] Error Disclosure対策

---

# 120. API Security Boundary

```text
Untrusted User Input
        ↓
Frontend
        ↓
Internet
        ↓
FastAPI
        ↓
Backend Validation
        ↓
Business Logic
        ↓
R2
```

Backend Validationより前のデータは信頼しない。

---

# 121. API Test

各APIについて以下をTestする。

```text
正常系
異常系
Boundary
Validation
Authentication
Authorization
Rate Limit
Timeout
Storage Error
```

---

# 122. Upload API Test

- [ ] 正常JPEG
- [ ] 正常PNG
- [ ] 正常WebP
- [ ] 空File
- [ ] 大容量File
- [ ] 非対応Format
- [ ] 破損画像
- [ ] MIME偽装
- [ ] 拡張子偽装
- [ ] 巨大画像
- [ ] Pixel数超過

---

# 123. Processing API Test

- [ ] 正常Palette
- [ ] Ratio合計100
- [ ] Ratio範囲外
- [ ] Invalid Color
- [ ] Strength 0
- [ ] Strength 1
- [ ] Strength範囲外
- [ ] Image Not Found
- [ ] Processing Error
- [ ] Processing Timeout

---

# 124. Result API Test

- [ ] Result存在
- [ ] Result未存在
- [ ] Image Not Found
- [ ] Storage Error

---

# 125. Download API Test

- [ ] 正常Download
- [ ] Content-Type
- [ ] Content-Disposition
- [ ] Storage Error
- [ ] Image Not Found

---

# 126. Delete API Test

- [ ] 正常Delete
- [ ] Image Not Found
- [ ] Storage Error
- [ ] 複数回Delete

---

# 127. API Performance

重要APIのResponse Timeを測定する。

特に、

```text
POST /api/images/{imageId}/process
```

のProcessing Timeを監視する。

---

# 128. Processing Performance

以下のImage Sizeについて測定する。

```text
Small
Medium
Large
```

---

# 129. API Timeout

Processingが一定時間を超えた場合に適切なErrorを返す。

---

# 130. API Availability

Backendが利用できない場合、Frontendは適切なError UIを表示する。

例：

```text
Backend unavailable
↓
「現在サービスを利用できません。」
```

---

# 131. API Maintenance

Backend Maintenance時は、

```http
503 Service Unavailable
```

などを利用する。

---

# 132. API Response Naming

JSON Fieldは基本的にcamelCaseを使用する。

例：

```json
{
  "imageId": "...",
  "fileSize": 102400,
  "mimeType": "image/jpeg"
}
```

Backend内部のPythonコードではsnake_caseを使用してもよい。

---

# 133. API Request Naming

Request JSONもcamelCaseを基本とする。

例：

```json
{
  "strength": 0.7,
  "palette": []
}
```

---

# 134. Null

不要なFieldを無理にnullで返さない。

Response SchemaでOptional Fieldを明確に定義する。

---

# 135. Boolean

BooleanはJSONのBoolean型を使用する。

```json
{
  "success": true
}
```

文字列：

```text
"true"
```

は使用しない。

---

# 136. Numeric Value

RatioやStrengthなどの数値はJSON Numberとして扱う。

---

# 137. Date / Time

将来的にTimestampをAPIで返す場合はISO 8601形式を基本とする。

例：

```text
2026-08-16T02:00:00Z
```

Backend内部ではUTCを基本とする。

---

# 138. API Naming

Resourceを基本にEndpointを命名する。

良い例：

```text
/api/images
/api/images/{imageId}
/api/images/{imageId}/process
```

---

# 139. API Namingで避けるもの

以下のようなVerb中心のEndpointを過剰に作らない。

```text
/api/uploadImage
/api/processImageNow
/api/getResult
```

Resource中心の設計を優先する。

---

# 140. API Endpoint一覧

MVP：

```text
POST   /api/images
GET    /api/images/{imageId}
POST   /api/images/{imageId}/process
GET    /api/images/{imageId}/result
GET    /api/images/{imageId}/download
DELETE /api/images/{imageId}
```

---

# 141. API MVP Scope

MVPでは以下に限定する。

```text
Image Upload
Image Information
Image Processing
Result
Download
Delete
```

---

# 142. MVPで実装しないAPI

以下は将来機能とする。

```text
Authentication
User API
Project API
Palette API
History API
Job API
Analytics API
```

---

# 143. Future Authentication API

将来的に必要に応じて、

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

などを追加する。

具体的なAuthentication Providerは別途決定する。

---

# 144. Future Project API

将来的に、

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/{projectId}
PATCH  /api/projects/{projectId}
DELETE /api/projects/{projectId}
```

などを追加する。

---

# 145. Future Palette API

将来的に、

```text
GET    /api/projects/{projectId}/palettes
POST   /api/projects/{projectId}/palettes
GET    /api/palettes/{paletteId}
PATCH  /api/palettes/{paletteId}
DELETE /api/palettes/{paletteId}
```

などを追加する。

---

# 146. Future History API

将来的にProcessing Historyを保存する場合、

```text
GET /api/projects/{projectId}/history
```

などを追加する。

---

# 147. API Evolution

APIは以下の順で拡張する。

```text
MVP
 ↓
Image API
 ↓
Processing API
 ↓
Authentication
 ↓
Project API
 ↓
Palette API
 ↓
History API
 ↓
Async Processing API
```

---

# 148. API Contract管理

API仕様は以下の3箇所で整合性を維持する。

```text
docs/06_api.md
        │
        ├── Backend Schema
        │
        └── Frontend API Client
```

---

# 149. API変更手順

API変更時：

```text
1. 仕様変更
      ↓
2. docs/06_api.md更新
      ↓
3. Backend Schema変更
      ↓
4. Backend実装変更
      ↓
5. Frontend API Client変更
      ↓
6. Frontend実装変更
      ↓
7. Test変更
      ↓
8. CI
```

---

# 150. Breaking Change

Breaking Changeを行う場合、以下を確認する。

- [ ] Frontendへの影響
- [ ] Backendへの影響
- [ ] Testへの影響
- [ ] Documentation
- [ ] Deployment順序

---

# 151. API Deployment

FrontendとBackendを独立してDeployできる構成とする。

ただしAPI Contract変更時はDeployment順序に注意する。

---

# 152. Backward Compatibility

Breaking Changeを避けられる場合は、既存Fieldを維持する。

削除するFieldがある場合はMigration期間を検討する。

---

# 153. API Monitoring

Productionでは以下を監視する。

```text
Request Count
Error Rate
Response Time
Status Code
Processing Time
Rate Limit
Storage Error
```

---

# 154. API Health Check

BackendにHealth Check Endpointを用意することを検討する。

```text
GET /health
```

Response：

```json
{
  "status": "ok"
}
```

---

# 155. Health Check

Health CheckはApplicationが起動していることを確認する。

Databaseを導入した場合はDatabase接続状態を別途確認する。

---

# 156. Readiness Check

将来的にWorkerやDatabaseなどの依存Componentが増えた場合、

```text
GET /health
GET /ready
```

などを分離する。

---

# 157. API Documentation UI

DevelopmentではFastAPIのOpenAPI UIを利用する。

例：

```text
/docs
```

または、

```text
/redoc
```

---

# 158. API Documentation Security

Production環境でOpenAPI UIを公開する場合はSecurity上の影響を確認する。

不要であればProductionでは無効化する。

---

# 159. API Design Principles

ColorFit APIでは以下を原則とする。

1. REST Resourceを基本とする。
2. HTTP Status Codeを適切に使用する。
3. Request / Response Schemaを明確にする。
4. Error Formatを統一する。
5. Request IDを利用する。
6. Backend Validationを必須とする。
7. Frontend ValidationをSecurity Boundaryにしない。
8. Image ProcessingをBackendで行う。
9. R2へのアクセスをBackendへ限定する。
10. SecretをFrontendへ公開しない。
11. API RouterへBusiness Logicを書きすぎない。
12. 将来的なAsync Processingを考慮する。

---

# 160. 禁止事項

以下を禁止する。

### Security

- FrontendへR2 Secretを渡す
- FrontendからR2へ直接Secret付きRequestを送る
- Stack TraceをAPI Responseへ返す
- User InputをStorage Keyへ直接使用する
- User InputをSQLへ直接連結する

### Architecture

- Routerへ大量のBusiness Logicを書く
- API Clientを各Componentに重複実装する
- API Contractを無視してFrontendとBackendを個別に変更する

### Image Processing

- Backend Validationを省略する
- File ExtensionだけでImage形式を判定する
- 無制限サイズの画像を処理する
- 無制限にProcessing Retryする

---

# 161. 完了条件

API設計は以下を満たすことを完了条件とする。

- [ ] API基本方針が定義されている
- [ ] Base URLが定義されている
- [ ] API Version方針が定義されている
- [ ] Endpoint一覧が定義されている
- [ ] HTTP Methodが定義されている
- [ ] Requestが定義されている
- [ ] Responseが定義されている
- [ ] HTTP Status Codeが定義されている
- [ ] Error Formatが定義されている
- [ ] Error Codeが定義されている
- [ ] Request IDが定義されている
- [ ] Upload APIが定義されている
- [ ] Image APIが定義されている
- [ ] Processing APIが定義されている
- [ ] Result APIが定義されている
- [ ] Download APIが定義されている
- [ ] Delete APIが定義されている
- [ ] File Validationが定義されている
- [ ] Color Validationが定義されている
- [ ] Ratio Validationが定義されている
- [ ] Strength Validationが定義されている
- [ ] Error Handlingが定義されている
- [ ] Rate Limitが定義されている
- [ ] CORS方針が定義されている
- [ ] Security方針が定義されている
- [ ] Retry方針が定義されている
- [ ] Timeout方針が定義されている
- [ ] API Testing方針が定義されている
- [ ] API Monitoring方針が定義されている
- [ ] OpenAPI方針が定義されている
- [ ] Future APIが定義されている
- [ ] MVP API Scopeが定義されている
