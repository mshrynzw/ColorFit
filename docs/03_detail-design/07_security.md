# ColorFit セキュリティ詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるセキュリティ対策の詳細設計を定義する。

ColorFitはユーザーが画像をアップロードし、Webデザインの配色に合わせて画像を加工するWebアプリケーションである。

そのため、以下のセキュリティリスクを重点的に考慮する。

- 不正な画像ファイル
- 大容量ファイル
- 悪意のあるファイル
- Path Traversal
- API Abuse
- Rate Limit
- CORS
- CSRF
- XSS
- Secret Leakage
- Storageへの不正アクセス
- 不正なImage IDアクセス
- Request Forgery
- DoS
- ログへの機密情報出力

---

# 2. セキュリティ基本方針

ColorFitでは以下を基本原則とする。

1. 最小権限の原則を採用する。
2. FrontendへSecretを公開しない。
3. Backendですべての重要な入力値を検証する。
4. ユーザーが指定した値をそのままStorage Keyへ使用しない。
5. R2 Bucketは原則Privateとする。
6. アップロードされた画像を信頼しない。
7. ファイル拡張子だけで画像形式を判定しない。
8. MIME Typeだけで画像形式を判定しない。
9. 実際の画像データをDecodeして検証する。
10. ファイルサイズと画像解像度を制限する。
11. APIへRate Limitを設定する。
12. エラーレスポンスから内部情報を漏洩させない。
13. SecretをGit Repositoryへ保存しない。
14. SecretをLogへ出力しない。
15. 不要な画像を長期間保存しない。
16. ProductionとDevelopmentの環境を分離する。
17. 依存ライブラリを適切に管理する。
18. HTTPSを使用する。
19. Security設定をFrontendとBackendの両方で実施する。
20. セキュリティ対策を実装時だけでなく運用時にも継続する。

---

# 3. セキュリティ対象

ColorFitでは以下を保護対象とする。

```text
User
 ├── Uploaded Image
 ├── Palette
 ├── Processing Settings
 └── Project Data

Application
 ├── API
 ├── Backend
 ├── Frontend
 └── Image Processing

Infrastructure
 ├── Cloudflare
 ├── Cloudflare R2
 └── Deployment Environment

Secrets
 ├── R2 Access Key
 ├── R2 Secret Access Key
 └── Other Environment Variables
```

---

# 4. Security Architecture

基本構成：

```text
                 Internet
                    │
                    ↓
             ┌─────────────┐
             │  Frontend   │
             └──────┬──────┘
                    │ HTTPS
                    ↓
             ┌─────────────┐
             │   FastAPI   │
             └──────┬──────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   Validation   Processing   Storage
        │           │           │
        │           │           ↓
        │           │      ┌──────────┐
        │           │      │ R2       │
        │           │      │ Private  │
        │           │      └──────────┘
        │           │
        └───────────┘
```

---

# 5. HTTPS

Production環境ではHTTPSを必須とする。

HTTPによる平文通信を使用しない。

対象：

```text
Frontend
↓
Backend API
```

---

# 6. HTTPS Redirect

HTTPへアクセスされた場合はHTTPSへRedirectする。

ProductionではHTTPS通信を基本とする。

---

# 7. TLS

TLSを利用して通信を暗号化する。

ユーザーの画像やAPI Requestを平文で送信しない。

---

# 8. Frontend Security

Frontendでは以下を実施する。

- HTTPSを使用する
- Secretを保持しない
- API Endpointを適切に管理する
- User Inputを安全に扱う
- XSSを防止する
- 不要なHTML Injectionを行わない
- 外部Scriptを最小限にする

---

# 9. FrontendへSecretを配置しない

以下の情報をFrontendへ含めない。

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
Database Password
API Secret
Private Token
```

Frontendへ公開される環境変数は公開情報として扱う。

---

# 10. Environment Variables

SecretはEnvironment Variableとして管理する。

例：

```text
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
```

SecretをSource Codeへ直接記述しない。

---

# 11. Git管理

以下をGit RepositoryへCommitしない。

```text
.env
.env.local
.env.production
Secret Key
Access Token
Password
Private Certificate
```

---

# 12. .gitignore

`.gitignore`へ以下のようなファイルを追加する。

```text
.env
.env.local
.env.*.local
```

実際のプロジェクト構成に合わせて調整する。

---

# 13. Secret Rotation

Secretが漏洩した可能性がある場合は、SecretをRotateする。

対象：

```text
R2 Access Key
R2 Secret Access Key
API Secret
```

---

# 14. R2 Access Key

R2 Access Keyには必要最小限の権限のみ付与する。

不要なBucketへのアクセス権を付与しない。

---

# 15. Development / Production分離

DevelopmentとProductionのCredentialsを分離する。

```text
Development
↓
Development R2 Credentials

Production
↓
Production R2 Credentials
```

Development環境からProduction R2へアクセスしない。

---

# 16. R2 Bucket

R2 Bucketは原則Privateとする。

```text
colorfit-images-prod
        ↓
Private
```

---

# 17. Public Bucket禁止

ユーザーがUploadした画像を保存するBucketを無条件でPublicにしない。

理由：

- ユーザー画像の意図しない公開
- URL漏洩
- 検索エンジンによるインデックス
- 不正アクセス

---

# 18. Storage Access

StorageへのアクセスはBackendを経由する。

基本：

```text
Frontend
   ↓
FastAPI
   ↓
Storage Service
   ↓
R2
```

---

# 19. R2 SecretのFrontend公開禁止

Frontendから直接R2へアクセスするためにSecret Keyを渡してはいけない。

以下は禁止：

```text
Frontend
   ↓
R2 Access Key
   ↓
R2
```

---

# 20. Storage Key

Storage KeyはBackendで生成する。

例：

```text
images/
  {image-id}/
    original
    processed
```

---

# 21. User InputとStorage Key

ユーザー入力をStorage Keyへ直接使用しない。

悪い例：

```text
images/{filename}
```

良い例：

```text
images/{uuid}/original
```

---

# 22. Path Traversal対策

以下のような入力をStorage Keyへ使用しない。

```text
../
./
../../
\
```

ユーザーが入力したファイル名をそのままPathとして利用しない。

---

# 23. Image ID

Image IDにはUUIDなどの推測困難な識別子を使用する。

例：

```text
7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

# 24. IDOR対策

Image IDを知っているだけで他ユーザーの画像へアクセスできる設計にしない。

認証機能を導入した場合は、

```text
Request User
      ↓
Image Owner
      ↓
Authorization Check
```

を行う。

---

# 25. MVPのImage Access

MVPではユーザー認証を実装しないため、Image IDの管理方法を慎重に設計する。

推測しにくいUUIDを使用し、画像URLを無条件にPublic化しない。

将来的に認証機能を追加した場合はUser IDによるAuthorizationを必須とする。

---

# 26. File Upload Security

ユーザーがUploadしたファイルは信頼しない。

以下を検証する。

```text
File Size
MIME Type
File Signature
Image Format
Image Dimensions
Image Decode
```

---

# 27. 拡張子を信用しない

以下のようなファイルを単純に拡張子だけで判定しない。

```text
malicious.exe
```

を

```text
image.jpg
```

へ変更しただけのファイルを画像として受け入れない。

---

# 28. MIME Typeを信用しない

HTTP RequestのContent-Typeだけを信用しない。

例えば、

```text
Content-Type: image/jpeg
```

でも、実際のデータがJPEGとは限らない。

実データをDecodeして検証する。

---

# 29. Magic Number / File Signature

必要に応じてファイルシグネチャを確認する。

例：

```text
JPEG
PNG
WebP
```

など。

ただし、最終的には画像LibraryによるDecodeも行う。

---

# 30. Image Decode

画像Libraryを使用して実際にDecodeできることを確認する。

```text
Upload
 ↓
Decode
 ↓
Success
```

Decodeできない場合はUploadを拒否する。

---

# 31. 画像形式

MVPでは対応形式を明確に定義する。

例：

```text
JPEG
PNG
WebP
```

対応形式以外は拒否する。

実際の対応形式は `01_requirements.md` と一致させる。

---

# 32. ファイルサイズ制限

Upload時には最大ファイルサイズを設定する。

例：

```text
MAX_FILE_SIZE
```

具体的な値は実装時に環境設定として定義する。

---

# 33. 解像度制限

画像の幅・高さにも上限を設定する。

例：

```text
MAX_IMAGE_WIDTH
MAX_IMAGE_HEIGHT
```

理由：

```text
巨大画像
↓
Memory使用量増加
↓
CPU使用量増加
↓
DoSリスク
```

---

# 34. Pixel Count制限

幅・高さだけではなく、総Pixel数も確認する。

例：

```text
width × height
```

が許容値を超えた場合は拒否する。

---

# 35. Decompression Bomb対策

画像Decode時に極端に巨大なPixel数へ展開される画像を警戒する。

画像Libraryの安全機能を利用し、必要に応じてPixel数制限を設定する。

---

# 36. ZIPなどの圧縮ファイル

MVPではZIPなどのArchive Uploadを受け付けない。

画像Upload APIでは単一画像ファイルのみを受け付ける。

---

# 37. SVG

SVGはHTML / JavaScriptなどを含むことができるため、MVPでは原則としてUpload対象外とする。

SVG対応が必要になった場合は別途Security設計を行う。

---

# 38. HTML Upload

HTMLファイルを画像として受け付けない。

---

# 39. JavaScript Upload

JavaScriptファイルを画像として受け付けない。

---

# 40. Executable Upload

Executableファイルを画像として受け付けない。

例：

```text
.exe
.dll
.bat
.cmd
.ps1
```

---

# 41. Image Re-Encoding

可能な場合、Uploadされた画像をDecodeして安全な形式へ再Encodeする。

概念：

```text
User Image
 ↓
Decode
 ↓
Image Object
 ↓
Re-Encode
 ↓
Safe Image
```

これにより不要なMetadataや不正な構造を除去できる。

---

# 42. EXIF

Original ImageにはEXIF Metadataが含まれている可能性がある。

EXIFには、

- GPS
- Camera Information
- Timestamp
- Software Information

などが含まれる可能性がある。

---

# 43. GPS Metadata

Processed / Export ImageではGPSなどの位置情報を削除する。

ユーザーが意図せず位置情報を公開することを防ぐ。

---

# 44. Metadata Stripping

Output Imageでは必要のないMetadataを可能な限り削除する。

対象：

```text
GPS
Camera Information
Software Information
Private Metadata
```

---

# 45. Filename Security

元ファイル名をUIへ表示する場合は適切にEscapeする。

HTMLへ直接埋め込まない。

---

# 46. XSS対策

ユーザー入力をHTMLとして解釈しない。

特に、

```text
filename
palette name
project name
```

などをUIへ表示する場合に注意する。

---

# 47. ReactによるXSS対策

Reactでは通常のText Renderingを利用する。

例えば、

```tsx
<span>{filename}</span>
```

のように表示する。

---

# 48. dangerouslySetInnerHTML

`dangerouslySetInnerHTML`は原則として使用しない。

使用する場合は、入力値を信頼せず、Sanitizationを行う。

MVPでは使用しないことを基本とする。

---

# 49. URL Injection

ユーザー入力をURLへ直接埋め込まない。

特に、

```text
javascript:
data:
```

などの危険なSchemeを許可しない。

---

# 50. CORS

Backend APIではCORSを適切に設定する。

Productionでは許可するOriginを明示する。

---

# 51. CORS Allow Origin

Productionで、

```text
*
```

を無条件に許可しない。

ColorFit FrontendのOriginのみを許可する。

例：

```text
https://colorfit.example.com
```

実際のDomainはDeployment時に設定する。

---

# 52. CORS Methods

必要なHTTP Methodのみ許可する。

例：

```text
GET
POST
DELETE
```

不要なMethodを許可しない。

---

# 53. CORS Headers

必要なRequest Headerのみ許可する。

不要なHeaderを無条件に許可しない。

---

# 54. Credentials

認証機能を導入した場合、CORS Credentials設定を慎重に行う。

Credential付きRequestを、

```text
Access-Control-Allow-Origin: *
```

と組み合わせない。

---

# 55. CSRF

MVPでTokenベースのAPI認証を採用する場合、CSRFリスクを認証方式に応じて評価する。

Cookieベースの認証を導入する場合はCSRF対策を必須とする。

---

# 56. CSRF Token

CookieベースのSession認証を採用する場合は、CSRF Token方式などを検討する。

MVPでは認証方式確定後に詳細を定義する。

---

# 57. Cookie Security

Cookieを利用する場合：

```text
Secure
HttpOnly
SameSite
```

を適切に設定する。

---

# 58. Authentication

MVPではユーザー認証を必須としない。

将来的にAuthenticationを導入する場合は、別途認証設計を追加する。

---

# 59. Authorization

認証導入後は、ユーザーが自分のResourceのみ操作できることを保証する。

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
```

は拒否。

---

# 60. API Authentication

将来的にAuthenticationを導入する場合、FrontendからBackend APIへ適切なCredentialを送信する。

SecretをLocal Storageへ安易に保存しない。

---

# 61. Token Logging禁止

Authentication TokenをLogへ出力しない。

---

# 62. Rate Limit

以下のAPIへRate Limitを設定する。

```text
Upload
Process
Download
Delete
```

特にCPU・Memoryを大量に使用するImage Processing APIを重点的に制限する。

---

# 63. Upload Rate Limit

大量Uploadを防止する。

概念：

```text
User / IP
 ↓
Upload Request
 ↓
Rate Limit
```

---

# 64. Processing Rate Limit

画像処理APIは特に高コストな処理になるため、厳しめのRate Limitを設定する。

---

# 65. Rate Limit Response

Rate Limit超過時：

```text
HTTP 429
```

Error Code：

```text
RATE_LIMIT_EXCEEDED
```

---

# 66. DoS対策

ColorFitでは以下のDoS対策を行う。

- File Size制限
- Pixel Count制限
- Processing Timeout
- Rate Limit
- Request Timeout
- Concurrency制御
- Storage容量管理

---

# 67. Concurrency Control

画像処理を無制限に並列実行しない。

必要に応じて、

```text
Processing Queue
```

やConcurrency Limitを導入する。

MVPではBackendのResource Limitを考慮した上で実装する。

---

# 68. Processing Timeout

画像処理にTimeoutを設定する。

処理が異常に長時間続く場合は中断する。

---

# 69. Memory Protection

画像処理ではMemory使用量を考慮する。

以下を制限する。

```text
File Size
Pixel Count
Concurrent Processing
```

---

# 70. CPU Protection

Color AnalysisやColor MatchingはCPU負荷が高くなる可能性がある。

大量RequestによってCPUを占有されないようRate LimitとConcurrency Limitを使用する。

---

# 71. Storage Abuse

大量画像UploadによるStorage Abuseを防止する。

対策：

```text
Upload Size Limit
Upload Rate Limit
Image Expiration
Storage Lifecycle
```

---

# 72. Storage Lifecycle

不要な画像は一定期間後に自動削除する。

```text
Upload
 ↓
Processing
 ↓
User Download
 ↓
Expiration
 ↓
Delete
```

詳細は、

`03_detail-design/05_storage.md`

で定義する。

---

# 73. Presigned URL

将来的にPresigned URLを使用する場合、URLの有効期限を短く設定する。

長期間有効なURLを発行しない。

---

# 74. Presigned URL Scope

Presigned URLは必要なObjectに限定する。

Bucket全体へのアクセス権を与えない。

---

# 75. Presigned URL Leakage

Presigned URLが第三者へ漏洩する可能性を考慮する。

必要以上に長い有効期限を設定しない。

---

# 76. Error Information Disclosure

Error Responseから内部情報を漏洩させない。

禁止：

```text
Python Stack Trace
File Path
R2 Endpoint
Access Key
Database Connection String
Library Version
```

---

# 77. Production Error

ProductionではGeneric Errorを返す。

例：

```text
予期しないエラーが発生しました。
時間をおいて再度お試しください。
```

---

# 78. Request ID

Error ResponseにはRequest IDを含める。

例：

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "予期しないエラーが発生しました。",
    "requestId": "xxxx"
  }
}
```

---

# 79. Security Logging

Security関連イベントを必要に応じてLogへ記録する。

例：

```text
Invalid Upload
Rate Limit
Unauthorized Request
Forbidden Request
Storage Access Error
```

---

# 80. Security Log

Security Logには以下を記録できる。

```text
timestamp
requestId
eventType
endpoint
IP情報
userId
result
```

ただし、IPアドレスなどの個人情報に該当し得る情報は、保存期間・利用目的を考慮して扱う。

---

# 81. Secret Logging禁止

以下を絶対にLogへ出力しない。

```text
Password
API Key
R2 Secret
Access Token
Refresh Token
Cookie
```

---

# 82. Image Logging禁止

画像BinaryをLogへ出力しない。

---

# 83. Dependency Security

BackendおよびFrontendの依存Packageを適切に管理する。

対象：

```text
React
React Router
FastAPI
Pillow
NumPy
その他Python Package
```

---

# 84. Dependency Update

依存PackageにはSecurity Updateが含まれる可能性があるため、定期的に更新を確認する。

ただし、無条件に最新版へ更新せず、Compatibilityを確認する。

---

# 85. Vulnerability Check

可能な範囲でDependencyの脆弱性を確認する。

Frontend：

```text
npm audit
```

または利用しているPackage Managerに対応したAudit機能を使用する。

Backendについても利用PackageのSecurity情報を確認する。

---

# 86. Lock File

依存PackageのVersionを安定させるため、Lock FileをGit管理する。

例：

```text
pnpm-lock.yaml
```

またはBackendで使用するPackage ManagerのLock File。

---

# 87. Supply Chain Security

不要なPackageを追加しない。

Package導入時には、

- Maintainer
- 更新状況
- Download実績
- Security Issue
- License
- Dependency

などを確認する。

---

# 88. Frontend Dependency

Frontendでは不要なThird-party Scriptを導入しない。

特に、

```text
Unknown CDN Script
Unknown Analytics
Unknown Tracking Script
```

などは慎重に扱う。

---

# 89. Backend Dependency

Backendでは必要最小限のPackageを利用する。

特にImage Processing関連PackageはSecurity Issueを確認する。

---

# 90. Pillow Security

Pillowなどの画像処理Libraryは、セキュリティ上重要なDependencyとして扱う。

バージョンアップ時にはRelease NoteとSecurity Advisoryを確認する。

---

# 91. Image Processing Sandbox

将来的に高度な画像処理を行う場合、Image ProcessingをApplication Serverから分離することを検討する。

概念：

```text
FastAPI
 ↓
Processing Worker
 ↓
Image Processing
```

これによりImage ProcessingのResource消費やLibraryリスクを分離できる。

MVPでは必須としない。

---

# 92. External Service

外部APIを利用する場合、以下を確認する。

- HTTPS
- Authentication
- Timeout
- Retry
- Rate Limit
- Error Handling
- Data Privacy

---

# 93. External API Secret

External APIのSecretはBackendのみで使用する。

Frontendへ公開しない。

---

# 94. API Timeout

External ServiceへのRequestにはTimeoutを設定する。

無制限に待機しない。

---

# 95. Retry

External ServiceへのRetryは限定的に行う。

無限Retryは禁止する。

---

# 96. Security Headers

ProductionではSecurity Headerを適切に設定する。

候補：

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

実際のDeployment環境に合わせて設定する。

---

# 97. Content-Security-Policy

CSPを導入する場合、必要なResourceのみを許可する。

基本的に不要な外部Scriptを許可しない。

---

# 98. X-Content-Type-Options

可能な限り、

```text
X-Content-Type-Options: nosniff
```

を設定する。

BrowserによるContent-Typeの推測を防止する。

---

# 99. Referrer-Policy

不要なReferer情報を外部へ送信しないよう適切なReferrer Policyを設定する。

例：

```text
strict-origin-when-cross-origin
```

---

# 100. Permissions-Policy

ColorFitが使用しないBrowser機能は可能な限り制限する。

例：

```text
camera
microphone
geolocation
```

など。

---

# 101. HSTS

ProductionでHTTPSを利用する場合、HSTSの導入を検討する。

例：

```text
Strict-Transport-Security
```

ただし、Domain構成を確認した上で導入する。

---

# 102. Clickjacking対策

ColorFitがFrameへ埋め込まれる必要がない場合、Clickjacking対策を行う。

CSPの、

```text
frame-ancestors
```

などを利用する。

---

# 103. API Request Validation

Backend APIではすべてのRequestをValidationする。

FrontendでValidation済みであっても、Backendで再度Validationする。

---

# 104. Frontend Validationを信用しない

Frontendで、

```text
file.size <= limit
```

などを確認していても、それだけをSecurity対策としない。

Backendでも同じ制限を確認する。

---

# 105. Input Sanitization

ユーザー入力を必要に応じてSanitizeする。

対象：

```text
Filename
Palette Name
Project Name
Text Input
```

---

# 106. JSON Input

JSON RequestではSchema Validationを行う。

BackendではPydanticなどを利用してValidationする。

---

# 107. Color Input

Color値は指定された形式のみ許可する。

基本的にHEX Colorを利用する。

例：

```text
#FFFFFF
#000000
#12ABEF
```

不正な値は拒否する。

---

# 108. Ratio Input

Ratioは指定範囲内であることを確認する。

例：

```text
0 <= ratio <= 100
```

さらにPalette全体の合計も検証する。

---

# 109. Strength Input

Color Matching Strengthなどの数値Inputは指定範囲を超えないようValidationする。

例：

```text
0.0 <= strength <= 1.0
```

---

# 110. Integer Overflow / Invalid Number

数値Inputについて、

```text
NaN
Infinity
非常に大きな値
負数
```

などを適切に拒否する。

---

# 111. API Method

API Endpointごとに許可するHTTP Methodを明確にする。

不要なMethodを受け付けない。

---

# 112. HTTP Request Size

画像ファイルだけでなく、HTTP Request全体のサイズにも制限を設ける。

巨大なJSONや不要なRequest BodyによるDoSを防止する。

---

# 113. Request Timeout

API RequestにTimeoutを設定する。

特に画像処理APIは、

```text
Upload
 ↓
Processing
```

に時間がかかるため、適切なTimeout値を設定する。

---

# 114. Server Information Disclosure

Response Headerなどから不要なServer情報を公開しない。

可能な範囲で、

```text
Framework Version
Python Version
Server Version
```

などを外部へ公開しない。

---

# 115. Debug Mode

ProductionではDebug Modeを有効にしない。

FastAPI / UvicornなどのDebug設定をProductionへ持ち込まない。

---

# 116. Development Debug

DevelopmentではDebug情報を利用してもよい。

ただし、Production CredentialsをDevelopment環境で使用しない。

---

# 117. Production Environment

Productionでは、

```text
DEBUG=false
```

など、利用するFrameworkに応じてDebugを無効化する。

---

# 118. CORS Environment

Development：

```text
http://localhost:xxxx
```

Production：

```text
https://production-domain
```

のようにEnvironmentごとに許可Originを分ける。

---

# 119. Hardcoded Domain

Source CodeへProduction Domainを大量にHardcodeしない。

Environment Variableなどで管理する。

---

# 120. Security Configuration

Security関連設定はConfigurationとしてまとめる。

例：

```text
MAX_FILE_SIZE
MAX_IMAGE_WIDTH
MAX_IMAGE_HEIGHT
MAX_PIXEL_COUNT
RATE_LIMIT
PROCESSING_TIMEOUT
CORS_ORIGINS
```

---

# 121. Configuration Validation

Application起動時に重要なSecurity ConfigurationをValidationする。

例：

```text
R2 Secretが存在する
CORS Originが設定されている
File Size Limitが正しい
```

---

# 122. Fail Fast

必須Security Configurationが存在しない場合、Applicationを不完全な状態で起動しない。

例：

```text
R2 Secret Missing
 ↓
Application Startup Failure
```

---

# 123. Error Handlingとの関係

Security Errorは、

`03_detail-design/06_error-handling.md`

のError Handling方針に従う。

特に、

```text
Authentication Error
Authorization Error
Rate Limit Error
Invalid Input
Internal Error
```

を統一的に扱う。

---

# 124. Storageとの関係

Storage Securityは、

`03_detail-design/05_storage.md`

の設計に従う。

特に、

- Private Bucket
- Access Key
- Storage Key
- Presigned URL
- Lifecycle
- Secret Management

を遵守する。

---

# 125. Image Processingとの関係

Image Processing Securityは、

`03_detail-design/03_image-processing.md`

の設計と整合させる。

特に、

```text
Image Decode
Pixel Limit
Memory Limit
EXIF
Re-Encode
```

を考慮する。

---

# 126. Color Matchingとの関係

Color MatchingへのInputはBackendでValidationする。

例：

```text
Palette
Ratio
Strength
Color
```

など。

---

# 127. Privacy

ColorFitはユーザーがUploadした画像を扱う。

そのため、画像を必要以上に保持しない。

基本：

```text
Upload
 ↓
Processing
 ↓
Result
 ↓
Expiration
 ↓
Delete
```

---

# 128. Data Minimization

保存する情報を必要最小限にする。

不要な情報をDatabaseやStorageへ保存しない。

---

# 129. Personal Information

画像に個人情報が含まれる可能性を考慮する。

例えば：

```text
人物
住所
書類
GPS
個人名
```

など。

---

# 130. Privacy by Design

ColorFitでは、設計段階からPrivacyを考慮する。

具体的には：

- Private Storage
- Automatic Deletion
- Metadata Removal
- Minimal Logging
- Secret Protection

を基本とする。

---

# 131. Data Retention

画像の保存期間を必要以上に長くしない。

R2 Lifecycleなどを利用して自動削除する。

詳細はStorage設計を参照する。

---

# 132. Backup

MVPではユーザー画像の長期Backupを行わない。

将来的に永続保存機能を追加する場合は、Backup Policyを別途設計する。

---

# 133. Security Incident

Security Incidentが発生した場合は以下の流れを基本とする。

```text
Detection
 ↓
Containment
 ↓
Investigation
 ↓
Credential Rotation
 ↓
Recovery
 ↓
Prevention
```

---

# 134. Secret Leakage

Secret漏洩が疑われる場合：

```text
1. Access Keyを無効化
2. 新しいKeyを発行
3. Environment Variablesを更新
4. Deployment
5. Logsを確認
```

などの対応を行う。

---

# 135. 不正アクセス

不正なRequestが検知された場合：

```text
Rate Limit
 ↓
Block / Reject
 ↓
Log
```

などの対応を行う。

---

# 136. Security Monitoring

将来的に以下を監視する。

```text
Rate Limit Errors
4xx Errors
5xx Errors
Upload Failure
Processing Failure
Unexpected Access
Storage Errors
```

---

# 137. Security Testing

Security Testでは以下を確認する。

### Upload

- [ ] 非画像ファイルをUploadできない
- [ ] 拡張子偽装を検知できる
- [ ] MIME偽装を検知できる
- [ ] 破損画像を拒否できる
- [ ] 大容量画像を拒否できる
- [ ] 巨大解像度画像を拒否できる
- [ ] Pixel数制限が機能する

### Storage

- [ ] BucketがPrivateである
- [ ] FrontendへR2 Secretが公開されていない
- [ ] 不正なStorage Keyへアクセスできない
- [ ] Presigned URLに適切な有効期限がある

### API

- [ ] Rate Limitが機能する
- [ ] CORSが適切に設定されている
- [ ] 不正なHTTP Methodを拒否する
- [ ] Request Size制限が機能する
- [ ] Timeoutが機能する

### Frontend

- [ ] XSSが発生しない
- [ ] ユーザー入力がHTMLとして実行されない
- [ ] SecretがBundleに含まれていない

---

# 138. XSS Test

以下のような入力をText Fieldへ入力してもScriptが実行されないことを確認する。

```text
<script>alert(1)</script>
```

---

# 139. Path Traversal Test

以下のようなInputを使用してもStorage外へアクセスできないことを確認する。

```text
../../secret
../
..\..\secret
```

---

# 140. File Upload Test

以下をテストする。

```text
fake.jpg
malicious.exe
script.html
archive.zip
corrupted.jpg
oversized.jpg
```

---

# 141. Rate Limit Test

大量Requestを送信し、

```text
HTTP 429
```

が適切に返ることを確認する。

---

# 142. CORS Test

許可されていないOriginからAPIへアクセスした場合、Requestが適切に拒否されることを確認する。

---

# 143. Secret Exposure Test

Production Build / Frontend Bundleを確認し、

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

などのSecretが含まれていないことを確認する。

---

# 144. Error Information Test

故意にBackend Errorを発生させ、

```text
Stack Trace
Server Path
R2 Credentials
Database Information
```

などがResponseへ含まれないことを確認する。

---

# 145. Dependency Security Test

Dependency Auditを実行し、重大な既知脆弱性が存在しないことを確認する。

---

# 146. Security Checklist

## Application

- [ ] HTTPS
- [ ] Debug無効
- [ ] Security Headers
- [ ] CORS
- [ ] Rate Limit
- [ ] Request Timeout

## Upload

- [ ] File Size Validation
- [ ] MIME Validation
- [ ] File Signature Validation
- [ ] Image Decode
- [ ] Pixel Limit
- [ ] Dimension Limit
- [ ] EXIF処理

## Storage

- [ ] Private Bucket
- [ ] Secret Protection
- [ ] UUID Storage Key
- [ ] Path Traversal対策
- [ ] Lifecycle Rule
- [ ] Presigned URL Expiration

## Frontend

- [ ] XSS対策
- [ ] Input Escaping
- [ ] Secret非公開
- [ ] Third-party Script最小化

## Backend

- [ ] Input Validation
- [ ] Exception Handling
- [ ] Error Response
- [ ] Logging
- [ ] Request ID

## Dependencies

- [ ] Lock File
- [ ] Security Audit
- [ ] Security Update確認

---

# 147. MVPで必須とするセキュリティ対策

MVPでは最低限、以下を必須とする。

```text
1. HTTPS
2. R2 Private Bucket
3. R2 SecretのFrontend非公開
4. Environment VariablesによるSecret管理
5. File Size制限
6. Image Dimension制限
7. Pixel Count制限
8. MIME Type検証
9. Image Decode検証
10. 対応画像形式制限
11. Path Traversal対策
12. UUIDによるStorage Key
13. CORS制限
14. Rate Limit
15. Processing Timeout
16. API Input Validation
17. XSS対策
18. Production Debug無効
19. Error Information Disclosure防止
20. 不要画像の自動削除
```

---

# 148. 将来的に追加するセキュリティ対策

以下はMVPでは必須としないが、将来的に検討する。

```text
Authentication
Authorization
CSRF Protection
Presigned URL
Security Monitoring
Sentry等のError Monitoring
WAF
Advanced Rate Limiting
Processing Worker
Security Sandbox
Backup
Disaster Recovery
```

---

# 149. セキュリティ設計原則

ColorFitでは以下を設計原則とする。

1. ユーザー入力を信用しない。
2. Frontend ValidationをSecurity対策として扱わない。
3. Backendで最終Validationする。
4. Uploadされた画像を信用しない。
5. StorageをPublicにしない。
6. SecretをFrontendへ渡さない。
7. SecretをGitへ保存しない。
8. SecretをLogへ出さない。
9. 推測可能なStorage Keyを使用しない。
10. Path Traversalを許可しない。
11. 巨大画像によるResource Exhaustionを防ぐ。
12. Processing APIをRate Limitする。
13. Processing Timeoutを設定する。
14. Errorから内部情報を漏洩させない。
15. 不要な画像を保存し続けない。
16. 不要なDependencyを追加しない。
17. ProductionとDevelopmentを分離する。
18. 最小権限の原則を採用する。
19. Privacyを設計段階から考慮する。
20. セキュリティ対策をテストで検証する。

---

# 150. 完了条件

Security詳細設計は以下を満たすことを完了条件とする。

- [ ] HTTPS方針が定義されている
- [ ] Secret管理方針が定義されている
- [ ] Environment Variable方針が定義されている
- [ ] GitへのSecret保存禁止が定義されている
- [ ] R2 Bucket Securityが定義されている
- [ ] Private Bucket方針が定義されている
- [ ] Storage Key Securityが定義されている
- [ ] Path Traversal対策が定義されている
- [ ] IDOR対策が定義されている
- [ ] File Upload Securityが定義されている
- [ ] MIME Type Validationが定義されている
- [ ] File Signature Validationが定義されている
- [ ] Image Decode Validationが定義されている
- [ ] File Size制限が定義されている
- [ ] Image Dimension制限が定義されている
- [ ] Pixel Count制限が定義されている
- [ ] EXIF対策が定義されている
- [ ] SVG対策が定義されている
- [ ] XSS対策が定義されている
- [ ] CORS方針が定義されている
- [ ] CSRF方針が定義されている
- [ ] Rate Limit方針が定義されている
- [ ] DoS対策が定義されている
- [ ] Processing Timeoutが定義されている
- [ ] Security Headersが定義されている
- [ ] Error Information Disclosure対策が定義されている
- [ ] Dependency Securityが定義されている
- [ ] Privacy方針が定義されている
- [ ] Data Retention方針が定義されている
- [ ] Security Incident対応方針が定義されている
- [ ] Security Testが定義されている
- [ ] MVP必須対策が定義されている
- [ ] 将来的なセキュリティ対策が定義されている
