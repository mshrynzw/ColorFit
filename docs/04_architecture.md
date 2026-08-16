# ColorFit システムアーキテクチャ設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitのシステム全体のアーキテクチャを定義する。

対象：

- Frontend
- Backend
- API
- Image Processing
- Color Matching
- Storage
- Security
- Deployment
- Development Environment
- CI/CD

本書では、各Componentの責務と接続関係を明確にし、実装時のArchitecture上の判断基準とする。

---

# 2. Architecture基本方針

ColorFitでは以下を基本方針とする。

1. FrontendとBackendを明確に分離する。
2. FrontendはReact Routerを使用する。
3. BackendはPython / FastAPIを使用する。
4. Image ProcessingはBackend側で実行する。
5. Color MatchingはBackend側で実行する。
6. StorageにはCloudflare R2を使用する。
7. FrontendからR2 Secretへ直接アクセスしない。
8. APIを介してFrontendとBackendを接続する。
9. BackendではLayerを分離する。
10. Business LogicをAPI Routerから分離する。
11. Image Processingを独立したModuleとして管理する。
12. Storage処理をStorage Serviceへ分離する。
13. Error Handlingを共通化する。
14. Security対策をArchitectureへ組み込む。
15. 将来的なAuthentication追加を考慮する。
16. MVPでは過剰なMicroservices化を行わない。
17. ポートフォリオとして理解しやすい構成を優先する。

---

# 3. 採用技術

## 3.1 Frontend

```text
React
React Router
TypeScript
Tailwind CSS
```

必要に応じて、

```text
shadcn/ui
```

などのUI Component Libraryを利用する。

---

# 3.2 Backend

```text
Python
FastAPI
Pydantic
```

Image Processingでは必要に応じて、

```text
Pillow
NumPy
```

などを使用する。

Color Matchingの実装内容に応じて追加Libraryを検討する。

---

# 3.3 Storage

```text
Cloudflare R2
```

を画像Storageとして使用する。

---

# 3.4 Development

```text
Git
GitHub
Cursor
VS Code
```

などを使用する。

---

# 3.5 Deployment

FrontendとBackendを分離してDeploymentする。

概念：

```text
Frontend
↓
Frontend Hosting

Backend
↓
Python Hosting

Storage
↓
Cloudflare R2
```

具体的なDeployment先はProject構成と無料枠を考慮して決定する。

---

# 4. 全体Architecture

ColorFitの基本Architecture：

```text
                         Internet
                            │
                            │ HTTPS
                            ↓
                ┌─────────────────────┐
                │      Frontend       │
                │                     │
                │ React               │
                │ React Router        │
                │ TypeScript          │
                │ Tailwind CSS        │
                └──────────┬──────────┘
                           │
                           │ HTTPS / REST API
                           ↓
                ┌─────────────────────┐
                │       Backend       │
                │                     │
                │ Python              │
                │ FastAPI             │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ↓                ↓                ↓
   ┌────────────┐   ┌──────────────┐  ┌─────────────┐
   │ Validation │   │ Image        │  │ Storage     │
   │            │   │ Processing   │  │ Service     │
   └────────────┘   └──────┬───────┘  └──────┬──────┘
                           │                 │
                           ↓                 ↓
                    ┌──────────────┐  ┌─────────────┐
                    │ Color        │  │ Cloudflare  │
                    │ Matching     │  │ R2          │
                    └──────────────┘  └─────────────┘
```

---

# 5. Frontend Architecture

FrontendはReact Routerを中心としたSPA構成とする。

基本構造：

```text
React
 ├── Router
 ├── Pages
 ├── Components
 ├── Hooks
 ├── API Client
 ├── State
 └── Utilities
```

---

# 6. Frontend Routing

ColorFitでは以下のRouteを基本とする。

```text
/
 /editor
 /result
 /settings
```

UI Referenceで作成した画面とRouteを対応させる。

---

# 7. Frontend Route Responsibilities

## `/`

Home画面。

役割：

- ColorFitの説明
- アプリケーションへの入口
- EditorへのNavigation

---

## `/editor`

Editor画面。

役割：

- Image Upload
- Image Preview
- Palette設定
- Ratio設定
- Color Matching設定
- Processing開始

---

## `/result`

Result画面。

役割：

- Original Image
- Processed Image
- 比較
- Download
- Editorへの戻る操作

---

## `/settings`

Settings画面。

役割：

- Application Settings
- UI Settings
- 将来的なUser Settings

---

# 8. Frontend Layer

Frontendでは以下のLayerを基本とする。

```text
Pages
 ↓
Components
 ↓
Hooks
 ↓
API Client
 ↓
Backend API
```

---

# 9. Pages

PageはRoute単位のUIを担当する。

例：

```text
HomePage
EditorPage
ResultPage
SettingsPage
```

PageへBusiness Logicを過剰に記述しない。

---

# 10. Components

再利用可能なUIをComponentとして管理する。

例：

```text
ImageUploader
ImagePreview
PaletteEditor
ColorPicker
RatioEditor
ProcessingButton
ResultComparison
DownloadButton
ErrorMessage
LoadingIndicator
```

---

# 11. Hooks

React Hooksでは、

- API通信
- Processing State
- Form State
- Image State

などを管理する。

例：

```text
useImageUpload
useImageProcessing
usePalette
useResult
```

---

# 12. API Client

FrontendからBackend APIへの通信は共通API Clientを利用する。

概念：

```text
Component
 ↓
Hook
 ↓
API Client
 ↓
HTTP
 ↓
FastAPI
```

各Componentから直接fetch処理を大量に記述しない。

---

# 13. API Clientの責務

API Clientでは以下を担当する。

- Request生成
- HTTP通信
- Response Parse
- Error Parse
- Request ID取得
- API Error変換

---

# 14. Frontend State

MVPでは必要以上にGlobal Stateを導入しない。

基本的には、

```text
Component State
↓
Custom Hook
```

を優先する。

Global Stateが必要になった場合のみ導入する。

---

# 15. Editor State

Editorでは以下のStateを管理する。

```text
Image
Palette
Ratio
Strength
Processing Status
Error
```

---

# 16. Processing State

基本：

```text
idle
 ↓
uploading
 ↓
processing
 ↓
success
```

Error：

```text
uploading
 ↓
error
```

```text
processing
 ↓
error
```

---

# 17. Result State

Processing成功後、Result情報を保持する。

例：

```text
resultImage
originalImage
processedImage
metadata
```

---

# 18. Backend Architecture

BackendはFastAPIを使用する。

基本：

```text
FastAPI
 ↓
Router
 ↓
Service
 ↓
Domain / Processing
 ↓
Infrastructure
```

---

# 19. Backend Layer

Backendでは以下のLayerを基本とする。

```text
API Layer
Application Layer
Domain Layer
Infrastructure Layer
```

---

# 20. API Layer

API LayerはHTTP Request / Responseを担当する。

責務：

- Routing
- Request Validation
- Response生成
- Authentication
- Authorization
- HTTP Status

Business Logicを大量に記述しない。

---

# 21. Application Layer

Application LayerではUse Caseを管理する。

例：

```text
UploadImage
ProcessImage
GetResult
DeleteImage
```

---

# 22. Domain Layer

Domain LayerではColorFit固有のBusiness Logicを管理する。

例：

```text
Color Matching
Palette
Ratio
Strength
Image Processing Rules
```

---

# 23. Infrastructure Layer

Infrastructure Layerでは外部Serviceとの接続を管理する。

例：

```text
R2
External API
File System
```

---

# 24. Backend Service

ServiceではUse Caseを実行する。

例：

```text
ImageService
ProcessingService
ColorMatchingService
StorageService
```

---

# 25. Image Service

Image Serviceでは、

- Upload
- Validation
- Image Metadata
- Image ID

などを扱う。

---

# 26. Processing Service

Processing Serviceでは、

```text
Image
 ↓
Image Processing
 ↓
Color Matching
 ↓
Output
```

を管理する。

---

# 27. Color Matching Service

Color Matching Serviceでは、

```text
Input Image
Palette
Ratio
Strength
```

を受け取り、Processed Imageを生成する。

---

# 28. Storage Service

Storage ServiceはR2へのアクセスを抽象化する。

例：

```text
upload()
download()
delete()
exists()
```

など。

---

# 29. R2への直接アクセス禁止

RouterやColor Matching Serviceから直接R2 SDKを呼び出さない。

```text
Bad:

Router
 ↓
R2 SDK
```

ではなく、

```text
Good:

Router
 ↓
Service
 ↓
Storage Service
 ↓
R2
```

とする。

---

# 30. Image Processing Architecture

Image ProcessingはBackend内の独立Moduleとして管理する。

概念：

```text
Processing Service
       ↓
Image Decoder
       ↓
Image Analyzer
       ↓
Color Matching
       ↓
Image Transformer
       ↓
Image Encoder
```

---

# 31. Image Decoder

役割：

- Image Decode
- Format Validation
- Dimension Validation
- Pixel Count Validation

---

# 32. Image Analyzer

必要に応じて画像のColor Informationを分析する。

例：

```text
Dominant Color
Color Distribution
Brightness
Saturation
```

---

# 33. Color Matching

Color Matchingでは、

```text
Image Colors
+
Target Palette
+
Ratio
+
Strength
```

を利用してColor Transformationを行う。

---

# 34. Image Transformer

Color Matching結果を画像へ適用する。

---

# 35. Image Encoder

処理後のImageを指定FormatへEncodeする。

例：

```text
JPEG
PNG
WebP
```

---

# 36. Processing Pipeline

基本的なProcessing Pipeline：

```text
Original Image
      ↓
Validation
      ↓
Decode
      ↓
Analyze
      ↓
Color Matching
      ↓
Transform
      ↓
Encode
      ↓
Output Validation
      ↓
Storage
```

---

# 37. Output Validation

Processed ImageをStorageへ保存する前に、

```text
Decodeできる
Formatが正しい
File Sizeが許容範囲
```

などを確認する。

---

# 38. API Architecture

FrontendとBackendはREST APIで通信する。

基本：

```text
Frontend
    │
    │ HTTPS
    ↓
FastAPI
```

---

# 39. API責務

APIは以下を担当する。

```text
Request
 ↓
Validation
 ↓
Use Case
 ↓
Response
```

---

# 40. APIとBusiness Logic

API RouterにBusiness Logicを直接記述しない。

悪い例：

```python
@router.post("/process")
def process():
    # 大量のImage Processing Logic
```

良い例：

```python
@router.post("/process")
def process():
    return processing_service.process(...)
```

---

# 41. API Error

API Errorは共通形式を使用する。

```json
{
  "error": {
    "code": "IMAGE_PROCESSING_FAILED",
    "message": "画像の処理に失敗しました。",
    "requestId": "..."
  }
}
```

詳細は、

`03_detail-design/06_error-handling.md`

を参照する。

---

# 42. Data Flow

基本的なUser Flow：

```text
User
 ↓
Frontend
 ↓
Image Upload
 ↓
Backend
 ↓
Validation
 ↓
R2
 ↓
Processing
 ↓
Color Matching
 ↓
Processed Image
 ↓
R2
 ↓
Backend
 ↓
Frontend
 ↓
Result
```

---

# 43. Upload Flow

```text
User
 ↓
Image Select
 ↓
Frontend Validation
 ↓
POST /api/images
 ↓
Backend Validation
 ↓
Storage Service
 ↓
R2
 ↓
Image ID
 ↓
Frontend
```

---

# 44. Processing Flow

```text
User
 ↓
Process Button
 ↓
Frontend
 ↓
POST /api/images/{imageId}/process
 ↓
Backend
 ↓
Validation
 ↓
Download Original
 ↓
Image Processing
 ↓
Color Matching
 ↓
Encode
 ↓
Upload Result
 ↓
Response
 ↓
Frontend
```

---

# 45. Result Flow

```text
Backend
 ↓
Processed Image
 ↓
R2
 ↓
Result API
 ↓
Frontend
 ↓
Result Page
```

---

# 46. Download Flow

```text
User
 ↓
Download
 ↓
Frontend
 ↓
Backend
 ↓
Storage Service
 ↓
R2
 ↓
Image
 ↓
Frontend
```

Presigned URLを利用する場合は、そのArchitectureに合わせる。

---

# 47. Delete Flow

```text
User
 ↓
Delete
 ↓
Backend
 ↓
Storage Service
 ↓
R2
 ↓
Delete
```

---

# 48. Storage Architecture

StorageはCloudflare R2を使用する。

基本構造：

```text
R2 Bucket
└── images/
    └── {imageId}/
        ├── original
        └── processed
```

実際のObject KeyはStorage設計に従う。

---

# 49. R2 Access

R2へのAccessはBackendからのみ行う。

```text
Frontend
   X
   │
   │ Direct Secret Access
   X
R2

Frontend
   │
   ↓
Backend
   │
   ↓
R2
```

---

# 50. Storage Security

R2 BucketはPrivateを基本とする。

詳細：

`03_detail-design/07_security.md`

を参照する。

---

# 51. Temporary Data

Image Processingで必要なTemporary Dataは、処理終了後にCleanupする。

---

# 52. Data Retention

画像を永続的に保存する必要がない場合、一定期間後に削除する。

Storage Lifecycleを利用する。

---

# 53. Error Architecture

Error Handlingは共通化する。

```text
Exception
 ↓
Domain Error
 ↓
Global Exception Handler
 ↓
Error Response
 ↓
Frontend Error Handler
 ↓
User Message
```

---

# 54. Backend Exception

内部ExceptionをそのままFrontendへ返さない。

```text
Pillow Exception
 ↓
ImageProcessingError
 ↓
IMAGE_PROCESSING_FAILED
```

のように変換する。

---

# 55. Frontend Error

FrontendではError Codeに応じてUIを決定する。

```text
FILE_TOO_LARGE
 ↓
File Size Error

IMAGE_PROCESSING_FAILED
 ↓
Processing Error + Retry

INTERNAL_SERVER_ERROR
 ↓
Generic Error
```

---

# 56. Security Architecture

Security Boundary：

```text
Internet
    │
    ↓
Frontend
    │
    │ HTTPS
    ↓
Backend
    │
    ├── Validation
    ├── Rate Limit
    ├── Authorization
    │
    ↓
Storage
```

---

# 57. Trust Boundary

ユーザーから送られてくるすべてのデータをUntrusted Dataとして扱う。

対象：

```text
Image
Filename
Palette
Ratio
Strength
Image ID
Query Parameter
Request Body
```

---

# 58. Security Validation

Backendでは、

```text
Input
 ↓
Validation
 ↓
Sanitization
 ↓
Business Logic
```

の順序を基本とする。

---

# 59. Deployment Architecture

DeploymentはFrontend / Backend / Storageを分離する。

```text
                    Internet
                       │
            ┌──────────┴──────────┐
            ↓                     ↓
       Frontend                Backend
            │                     │
            │                     ↓
            │                  R2
            │
            └──── HTTPS API ──────┘
```

---

# 60. Frontend Deployment

FrontendはReact ApplicationとしてDeployする。

候補となるHostingは、

```text
Vercel
Cloudflare Pages
Netlify
```

など。

最終的なHostingは無料枠、React Routerとの相性、Deploymentの容易さを考慮して決定する。

---

# 61. Backend Deployment

BackendはPython / FastAPIをDeployできるHostingを利用する。

候補：

```text
Render
Railway
Fly.io
Cloud Run
```

など。

最終的なHostingは無料枠、Sleep / Cold Start、Image ProcessingのResource制限などを考慮して決定する。

---

# 62. Storage Deployment

StorageはCloudflare R2を使用する。

```text
Backend
 ↓
Cloudflare R2
```

---

# 63. Development Architecture

Local DevelopmentではFrontendとBackendを別Processで起動する。

例：

```text
Terminal 1
↓
Frontend
localhost:5173

Terminal 2
↓
Backend
localhost:8000
```

実際のPortはProject設定に従う。

---

# 64. Local Development Flow

```text
Browser
 ↓
localhost:5173
 ↓
React
 ↓
localhost:8000
 ↓
FastAPI
```

---

# 65. Local R2

DevelopmentではProduction R2を使用しない。

必要に応じて、

```text
Development R2
```

を用意する。

---

# 66. Environment

Environmentを分離する。

```text
Development
Test
Production
```

---

# 67. Environment Configuration

Frontend：

```text
API_BASE_URL
```

Backend：

```text
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
CORS_ORIGINS
```

など。

---

# 68. Secret管理

SecretはEnvironment Variableで管理する。

Git RepositoryへCommitしない。

---

# 69. CI/CD Architecture

GitHub Actionsなどを利用してCI/CDを構築する。

基本：

```text
Git Push
 ↓
GitHub Actions
 ↓
Lint
 ↓
Type Check
 ↓
Unit Test
 ↓
Build
 ↓
Deploy
```

---

# 70. Frontend CI

Frontendでは最低限：

```text
Lint
Type Check
Test
Build
```

を実行する。

---

# 71. Backend CI

Backendでは最低限：

```text
Lint
Test
Dependency Check
```

などを実行する。

---

# 72. Deployment Trigger

基本的には、

```text
Pull Request
 ↓
CI
```

```text
Main Merge
 ↓
Production Deployment
```

という流れを基本とする。

---

# 73. Repository Architecture

FrontendとBackendは同一Repository内で管理する。

基本構成：

```text
colorfit/
├── frontend/
├── backend/
├── docs/
├── .cursor/
├── .vscode/
├── .gitignore
└── README.md
```

---

# 74. Monorepo方式

ColorFitではFrontendとBackendを同一Repositoryに配置する。

これをMonorepo方式として扱う。

---

# 75. Monorepoを採用する理由

ColorFitではFrontendとBackendを分離しつつ、Repositoryは一つにする。

理由：

- 個人開発で管理しやすい
- Docsを共有できる
- Issueを一元管理できる
- Frontend / Backendの変更を同時に管理できる
- ポートフォリオとして構造が分かりやすい
- API仕様と実装を同一Repositoryで管理できる

---

# 76. Frontend Directory

基本構成：

```text
frontend/
├── src/
│   ├── routes/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── api/
│   ├── types/
│   └── assets/
├── public/
├── tests/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

実際の構成は実装時に調整する。

---

# 77. Backend Directory

基本構成：

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── processing/
│   ├── storage/
│   └── main.py
├── tests/
├── pyproject.toml
└── README.md
```

---

# 78. Backend Directory Responsibilities

```text
api/
↓
API Endpoint

core/
↓
Configuration / Common

models/
↓
Domain Model

schemas/
↓
Request / Response Schema

services/
↓
Application Logic

processing/
↓
Image Processing / Color Matching

storage/
↓
Object Storage Access（Local / R2 Adapter）

tests/
↓
Backend Tests
```

---

# 79. Docs Directory

DocumentationはRepository Rootの`docs`へ配置する。

```text
docs/
├── ui-reference/
├── 01_requirements.md
├── 02_basic-design.md
├── 03_detail-design/
├── 04_architecture.md
├── 05_database.md
├── 06_api.md
├── 07_component_design.md
├── 08_ui_guideline.md
├── development-log.md
├── product.md
├── roadmap.md
└── screen-list.md
```

---

# 80. Cursor Rules

Cursor RulesはRepository Rootの`.cursor`へ配置する。

例：

```text
.cursor/
└── rules/
```

詳細なRule構成はProjectのCursor Rule設計に従う。

---

# 81. VS Code

VS Code設定は、

```text
.vscode/
```

で管理する。

例：

```text
.vscode/
├── settings.json
├── extensions.json
└── launch.json
```

必要なものだけ配置する。

---

# 82. Frontend / Backend責務分離

Frontend：

```text
UI
Interaction
Routing
Client State
API Client
```

Backend：

```text
Validation
Business Logic
Image Processing
Color Matching
Storage
Security
```

---

# 83. Frontendで行う処理

Frontendでは以下を担当する。

- UI Rendering
- User Interaction
- Form Validation
- Image Preview
- Loading State
- Error Display
- API Request
- Result Display

---

# 84. Backendで行う処理

Backendでは以下を担当する。

- Input Validation
- Image Validation
- Image Processing
- Color Analysis
- Color Matching
- Image Transformation
- Storage
- Security
- Error Handling

---

# 85. Frontendで行わない処理

重要なImage ProcessingやColor MatchingをFrontendだけで完結させない。

理由：

- Client CPUへの負荷
- Browser差異
- Algorithm保護
- Server-side統一
- Python利用のArchitecture

---

# 86. Backendで行わないUI処理

BackendではUI固有の処理を行わない。

例えば、

```text
Button Animation
Modal
Toast
Page Transition
```

など。

---

# 87. API Contract

FrontendとBackend間ではAPI Contractを明確にする。

対象：

```text
Request
Response
Error
Status Code
```

詳細は、

`06_api.md`

を参照する。

---

# 88. Type Safety

FrontendではTypeScript Typeを利用する。

API Responseの型も可能な限り定義する。

例：

```text
ImageResponse
ProcessingResponse
ErrorResponse
```

---

# 89. Backend Schema

BackendではPydanticなどを利用してRequest / Response Schemaを定義する。

FrontendとAPI Contractを一致させる。

---

# 90. API Contract変更

API Contractを変更する場合：

```text
API Schema
 ↓
Backend
 ↓
Frontend
 ↓
Test
```

の順に影響範囲を確認する。

---

# 91. Versioning

MVPではAPI Versioningを過剰に複雑化しない。

将来的にBreaking Changeが増えた場合、

```text
/api/v1/
```

などのVersioningを検討する。

---

# 92. Synchronous Processing

MVPでは画像処理を基本的にSynchronous APIとして実装する。

概念：

```text
POST /process
 ↓
Processing
 ↓
Response
```

---

# 93. Asynchronous Processing

画像処理時間が長くなった場合は、将来的にAsynchronous Processingへ移行する。

概念：

```text
POST /process
 ↓
Job Created
 ↓
Job ID
 ↓
Processing
 ↓
GET /jobs/{jobId}
 ↓
Result
```

---

# 94. Queue Architecture

Processing量が増えた場合、

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Image Processing
 ↓
R2
```

への移行を検討する。

MVPでは必須としない。

---

# 95. Worker Architecture

将来的にImage Processing Workerを分離する場合：

```text
FastAPI
 ↓
Processing Queue
 ↓
Worker
 ↓
Pillow / NumPy
 ↓
R2
```

とする。

---

# 96. Scalability

MVPではSingle Backend構成を基本とする。

必要以上にMicroservices化しない。

---

# 97. 将来的なScaling

ユーザー数や処理量が増えた場合、

```text
Frontend
 ↓
API
 ↓
Queue
 ↓
Workers
 ↓
Storage
```

へ拡張できる構造を目指す。

---

# 98. Observability

将来的に以下を監視する。

```text
Request Count
Response Time
Error Rate
Processing Time
Storage Error
CPU
Memory
```

---

# 99. Logging Architecture

BackendではStructured Loggingを検討する。

基本：

```text
timestamp
level
requestId
endpoint
status
processingTime
errorCode
```

---

# 100. Request Trace

Request IDをFrontend → Backend → Storageまで可能な限り引き継ぐ。

概念：

```text
Frontend
 requestId
    ↓
Backend
 requestId
    ↓
Processing
 requestId
    ↓
Storage
 requestId
```

---

# 101. Error Monitoring

将来的にSentryなどのError Monitoring Serviceを導入できるArchitectureとする。

MVPでは必須としない。

---

# 102. Performance Architecture

画像処理はCPU / Memoryを消費するため、

```text
Upload
 ↓
Validation
 ↓
Processing
 ↓
Storage
```

の各段階でResourceを考慮する。

---

# 103. Performance Optimization

必要に応じて、

- Image Resize
- Thumbnail
- Lazy Loading
- Compression
- Caching
- Processing Optimization

などを導入する。

---

# 104. Frontend Image Loading

Result Imageなど大きな画像を表示する場合、必要に応じて、

```text
Thumbnail
 ↓
Full Resolution
```

のような段階的Loadingを検討する。

---

# 105. Caching

静的Assetや再利用可能なResourceについてCachingを利用する。

ただし、ユーザー画像などPrivate Dataを無条件にPublic Cacheしない。

---

# 106. Database Architecture

MVPでDatabaseが必要な場合は、最小限の構成とする。

Databaseを利用する場合も、

```text
Frontend
 ↓
API
 ↓
Service
 ↓
Database
```

とし、Frontendから直接Databaseへアクセスしない。

---

# 107. Databaseが不要な場合

MVPでユーザー認証や永続Project管理を実装しない場合、Databaseを必須Componentとしない。

画像Metadataなどは必要最小限の方法で管理する。

---

# 108. Architecture Decision

ColorFitでは、

```text
Frontend
↓
React Router

Backend
↓
Python / FastAPI

Image Processing
↓
Python

Storage
↓
Cloudflare R2
```

という構成を基本Architectureとする。

---

# 109. Architecture Decisionの理由

## React Router

- Reactベースで実装できる
- Routingを明確に管理できる
- UI Componentと相性がよい
- PortfolioとしてFrontend技術を示しやすい

## FastAPI

- PythonをBackendで利用できる
- API実装がシンプル
- Type Validationが行いやすい
- Image Processingとの相性がよい
- OpenAPIを利用できる

## Cloudflare R2

- Object Storageとして利用できる
- Backendとの分離が容易
- 画像データの保存先として適している

---

# 110. Portfolio Architecture

ColorFitはPortfolioとして、

```text
React
+
TypeScript
+
React Router
+
Python
+
FastAPI
+
Image Processing
+
Color Science
+
Cloudflare R2
```

を組み合わせる。

これにより、

```text
Frontend Development
Backend Development
Image Processing
Web Design
```

を一つのApplicationで示すことができる。

---

# 111. Architectureの原則

ColorFitでは以下を原則とする。

1. Frontend / Backendを分離する。
2. UIとBusiness Logicを分離する。
3. APIとBusiness Logicを分離する。
4. Image Processingを独立させる。
5. Color Matchingを独立させる。
6. Storageを抽象化する。
7. Error Handlingを共通化する。
8. SecurityをArchitectureに組み込む。
9. ProductionとDevelopmentを分離する。
10. MVPでは過剰設計しない。
11. 将来的なScalingを考慮する。
12. Portfolioとして理解しやすい構成にする。

---

# 112. Architecture上の禁止事項

以下を原則として禁止する。

### Frontend

- Backend SecretをFrontendへ公開しない
- R2 SecretをFrontendへ公開しない
- 重要なBusiness LogicをFrontendだけに依存しない

### Backend

- Routerへ大量のBusiness Logicを書かない
- R2へ直接アクセスする処理を複数箇所へ分散させない
- Library ExceptionをそのままAPI Responseへ返さない

### Storage

- Production BucketをPublicにしない
- ユーザー入力をStorage Keyへ直接使用しない

### Security

- SecretをGitへCommitしない
- SecretをLogへ出力しない
- ProductionでDebug Modeを有効にしない

---

# 113. Architecture Testing

Architecture変更時には以下を確認する。

- [ ] Frontend / Backend責務が維持されている
- [ ] API Contractが壊れていない
- [ ] Storage AccessがService経由になっている
- [ ] Image Processingが適切に分離されている
- [ ] Error Handlingが共通化されている
- [ ] Security Boundaryが維持されている
- [ ] TestがPassする

---

# 114. Architecture Evolution

ColorFitではMVPから段階的にArchitectureを拡張する。

## Phase 1

```text
React Router
 +
FastAPI
 +
Image Processing
 +
R2
```

## Phase 2

```text
Authentication
 +
Project Management
 +
Database
```

## Phase 3

```text
Queue
 +
Worker
 +
Async Processing
```

## Phase 4

```text
Monitoring
 +
Scaling
 +
Advanced Processing
```

---

# 115. MVP Architecture

MVPでは以下を採用する。

```text
┌───────────────────────┐
│       Frontend        │
│                       │
│ React                 │
│ React Router          │
│ TypeScript            │
│ Tailwind CSS          │
└───────────┬───────────┘
            │
            │ REST API
            ↓
┌───────────────────────┐
│       Backend         │
│                       │
│ Python                │
│ FastAPI               │
│                       │
│ Validation            │
│ Image Processing      │
│ Color Matching        │
│ Storage Service       │
└───────────┬───────────┘
            │
            ↓
┌───────────────────────┐
│   Cloudflare R2       │
│       Private         │
└───────────────────────┘
```

---

# 116. 完了条件

Architecture設計は以下を満たすことを完了条件とする。

- [ ] 全体Architectureが定義されている
- [ ] Frontend Architectureが定義されている
- [ ] Backend Architectureが定義されている
- [ ] API Architectureが定義されている
- [ ] Image Processing Architectureが定義されている
- [ ] Color Matching Architectureが定義されている
- [ ] Storage Architectureが定義されている
- [ ] Security Boundaryが定義されている
- [ ] Data Flowが定義されている
- [ ] Deployment Architectureが定義されている
- [ ] Development Architectureが定義されている
- [ ] CI/CD Architectureが定義されている
- [ ] Repository Architectureが定義されている
- [ ] Frontend / Backend責務分担が定義されている
- [ ] API Contractの方針が定義されている
- [ ] Error Handlingとの関係が定義されている
- [ ] Storageとの関係が定義されている
- [ ] Securityとの関係が定義されている
- [ ] Testingとの関係が定義されている
- [ ] MVP Architectureが定義されている
- [ ] 将来的なScaling方針が定義されている
- [ ] Architecture Evolutionが定義されている
