# ColorFit エラーハンドリング詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるエラーハンドリングの詳細設計を定義する。

対象：

- Frontend
- Backend
- API
- Image Processing
- Color Matching
- Storage
- Validation
- Network
- Unexpected Error
- Logging
- Retry
- User Notification

ColorFitでは、ユーザーが理解できるエラーと、開発者が調査するための内部エラーを分離する。

---

# 2. 基本方針

ColorFitのエラーハンドリングでは、以下を原則とする。

1. エラーを握りつぶさない。
2. FrontendとBackendでエラー形式を統一する。
3. ユーザーには理解しやすいメッセージを表示する。
4. 開発者向けの詳細情報はログへ記録する。
5. Stack Traceなどの内部情報をユーザーへ返さない。
6. Secretや個人情報をエラーメッセージへ含めない。
7. Retry可能なエラーとRetry不可能なエラーを分離する。
8. HTTP Status Codeを適切に使用する。
9. Backendで最終的な入力値検証を行う。
10. Unexpected Errorを適切に処理する。
11. 同じエラー形式を可能な限りすべてのAPIで使用する。
12. 画像処理エラーとStorageエラーを分離する。
13. エラー発生時に不要な一時ファイルを残さない。
14. エラーコードを機械的に判定できるようにする。
15. ユーザーが再試行できる場合は明確に案内する。

---

# 3. エラーの分類

ColorFitでは、エラーを以下に分類する。

```text
Validation Error
Authentication / Authorization Error
Image Processing Error
Color Matching Error
Storage Error
Network Error
Rate Limit Error
External Service Error
Unexpected Error
```

---

# 4. エラー処理の全体像

基本的な流れ：

```text
User Action
    ↓
Frontend
    ↓
API Request
    ↓
Backend
    ↓
Validation
    ↓
Business Logic
    ↓
Image Processing
    ↓
Storage
    ↓
Response
    ↓
Frontend Error Handling
    ↓
User Notification
```

エラーが発生した場合：

```text
Error
 ↓
Error Classification
 ↓
Error Code
 ↓
HTTP Status
 ↓
API Error Response
 ↓
Frontend Error Handler
 ↓
User Message
```

---

# 5. Error Code

ColorFitでは、エラーを文字列のError Codeで識別する。

例：

```text
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_IMAGE_FORMAT
INVALID_PALETTE
INVALID_RATIO
IMAGE_PROCESSING_FAILED
COLOR_MATCHING_FAILED
STORAGE_UPLOAD_FAILED
STORAGE_DOWNLOAD_FAILED
STORAGE_DELETE_FAILED
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

FrontendはError Messageではなく、原則としてError Codeを基準に処理を分岐する。

---

# 6. Error Codeの命名規則

Error Codeは大文字のSnake Caseを使用する。

例：

```text
INVALID_FILE
IMAGE_PROCESSING_FAILED
STORAGE_UPLOAD_FAILED
```

以下のような形式は使用しない。

```text
invalidFile
invalid-file
InvalidFile
```

---

# 7. API Error Response

APIでエラーが発生した場合、基本的に以下の形式で返す。

```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "対応していない画像形式です。",
    "requestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

# 8. Error Responseの項目

基本項目：

```text
error
 ├── code
 ├── message
 └── requestId
```

### code

機械的にエラーを識別するためのコード。

### message

ユーザーへ表示可能なメッセージ。

### requestId

エラー調査に利用する一意なID。

---

# 9. Request ID

各API RequestにはRequest IDを付与する。

例：

```text
7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Request IDは、

- Backend Log
- API Response
- Error Report

などで利用する。

---

# 10. Request IDの目的

ユーザーが、

> 「エラーが発生しました」

と問い合わせた場合、

```text
Request ID
```

を利用してBackend Logから該当Requestを検索できるようにする。

---

# 11. HTTP Status Code

基本的に以下のStatus Codeを使用する。

| Status | 用途                   |
| ------ | ---------------------- |
| 400    | 不正なRequest          |
| 401    | 認証が必要             |
| 403    | 権限不足               |
| 404    | リソースが存在しない   |
| 413    | ファイルサイズ超過     |
| 415    | 非対応Media Type       |
| 422    | 入力値Validation Error |
| 429    | Rate Limit超過         |
| 500    | Internal Server Error  |
| 502    | 外部サービスエラー     |
| 503    | Service Unavailable    |
| 504    | Timeout                |

---

# 12. 400 Bad Request

Requestそのものが不正な場合に使用する。

例：

```text
JSON形式が不正
必須パラメータが不正
Request構造が不正
```

---

# 13. 401 Unauthorized

認証機能を導入した場合に使用する。

例：

```text
ログインしていない
Tokenが存在しない
Tokenが無効
```

MVPで認証を実装しない場合は基本的に使用しない。

---

# 14. 403 Forbidden

認証済みだがアクセス権がない場合に使用する。

将来的なユーザー・プロジェクト管理で利用する。

---

# 15. 404 Not Found

指定されたResourceが存在しない場合に使用する。

例：

```text
IMAGE_NOT_FOUND
PROJECT_NOT_FOUND
```

---

# 16. 413 Payload Too Large

アップロードされた画像が許容サイズを超えている場合に使用する。

例：

```text
FILE_TOO_LARGE
```

---

# 17. 415 Unsupported Media Type

対応していない画像形式の場合に使用する。

例：

```text
UNSUPPORTED_IMAGE_FORMAT
```

---

# 18. 422 Unprocessable Entity

Requestの構造自体は正しいが、入力値が要件を満たしていない場合に使用する。

例：

```text
INVALID_PALETTE
INVALID_RATIO
INVALID_STRENGTH
```

---

# 19. 429 Too Many Requests

Rate Limitを超えた場合に使用する。

例：

```text
RATE_LIMIT_EXCEEDED
```

---

# 20. 500 Internal Server Error

Backend内部で予期しないエラーが発生した場合に使用する。

ユーザーには詳細なException情報を返さない。

例：

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "予期しないエラーが発生しました。時間をおいて再度お試しください。",
    "requestId": "..."
  }
}
```

---

# 21. 502 Bad Gateway

外部サービスとの通信で、外部サービス側の異常が原因となる場合に使用する。

例：

```text
Cloudflare R2
External API
```

など。

---

# 22. 503 Service Unavailable

Backendまたは依存サービスが一時的に利用できない場合に使用する。

---

# 23. 504 Gateway Timeout

外部サービスや内部処理がTimeoutした場合に使用する。

---

# 24. Validation Error

入力値の検証に失敗した場合のエラー。

対象：

```text
File
Palette
Ratio
Strength
Image ID
Format
```

---

# 25. File Validation

画像Upload時にはBackendで以下を検証する。

```text
File Size
MIME Type
Image Format
Image Decode
Image Dimensions
```

---

# 26. INVALID_FILE

ファイル自体が不正な場合。

例：

```text
空ファイル
破損ファイル
画像としてDecodeできない
```

Response：

```text
HTTP 400 / 422
```

---

# 27. FILE_TOO_LARGE

許容サイズを超えた場合。

例：

```text
HTTP 413
```

ユーザーメッセージ：

```text
「ファイルサイズが大きすぎます。」
```

---

# 28. UNSUPPORTED_IMAGE_FORMAT

対応していない形式の場合。

例：

```text
HTTP 415
```

ユーザーメッセージ：

```text
「対応していない画像形式です。」
```

---

# 29. IMAGE_DIMENSIONS_TOO_LARGE

画像の幅または高さが上限を超えた場合。

例：

```text
IMAGE_DIMENSIONS_TOO_LARGE
```

HTTP Status：

```text
413
```

または

```text
422
```

を使用する。

---

# 30. IMAGE_DECODE_FAILED

画像をDecodeできない場合。

例：

```text
IMAGE_DECODE_FAILED
```

原因：

- 破損画像
- 不正な画像データ
- 拡張子と実データの不一致

---

# 31. Palette Validation

ColorFitではWebデザインPaletteをBackendでも検証する。

検証対象：

```text
Primary
Secondary
Accent
Ratio
```

---

# 32. INVALID_COLOR

HEXなどのColor値が不正な場合。

例：

```text
#GGGGGG
123456
#12345
```

など。

---

# 33. INVALID_PALETTE

Palette全体の構造が不正な場合。

例：

```text
Primaryが存在しない
Secondaryが存在しない
Accentが不正
```

---

# 34. INVALID_RATIO

Palette Ratioが不正な場合。

例：

```text
Primary 60
Secondary 30
Accent 30
```

合計：

```text
120%
```

---

# 35. Ratio Validation

MVPではPalette Ratioの合計を100%とする。

```text
Primary
+
Secondary
+
Accent
=
100%
```

許容誤差を設ける場合は、その値を実装時に明確に定義する。

---

# 36. INVALID_STRENGTH

Color Matching Strengthが範囲外の場合。

基本：

```text
0.0 ～ 1.0
```

---

# 37. Image ID Validation

Image IDが不正な場合。

例：

```text
存在しないUUID
不正な文字列
空文字
```

---

# 38. IMAGE_NOT_FOUND

指定されたImage IDに対応する画像が存在しない場合。

HTTP：

```text
404
```

---

# 39. Image Processing Error

画像処理中に発生するエラー。

例：

```text
IMAGE_PROCESSING_FAILED
IMAGE_DECODE_FAILED
IMAGE_ENCODE_FAILED
IMAGE_TRANSFORM_FAILED
```

---

# 40. IMAGE_PROCESSING_FAILED

画像処理全体で予期しない問題が発生した場合。

ユーザーには、

```text
「画像の処理に失敗しました。」
```

などのメッセージを表示する。

内部Logには詳細Exceptionを記録する。

---

# 41. IMAGE_TRANSFORM_FAILED

Color Transformationなどの処理に失敗した場合。

---

# 42. IMAGE_ENCODE_FAILED

処理結果をJPEG / PNG / WebPなどへEncodeできない場合。

---

# 43. Color Matching Error

ColorFit独自のColor Matching処理で発生するエラー。

例：

```text
COLOR_ANALYSIS_FAILED
COLOR_MATCHING_FAILED
COLOR_TRANSFORM_FAILED
COLOR_GAMUT_MAPPING_FAILED
```

---

# 44. COLOR_ANALYSIS_FAILED

画像のColor Analysisに失敗した場合。

例：

```text
Color Clustering Failure
Invalid Image Data
Memory Error
```

---

# 45. COLOR_MATCHING_FAILED

PaletteとのColor Matchingに失敗した場合。

---

# 46. COLOR_TRANSFORM_FAILED

Target ColorへのTransformationに失敗した場合。

---

# 47. COLOR_GAMUT_MAPPING_FAILED

色域外処理に失敗した場合。

通常は内部エラーとして扱う。

---

# 48. Storage Error

Cloudflare R2関連のエラー。

例：

```text
STORAGE_UPLOAD_FAILED
STORAGE_DOWNLOAD_FAILED
STORAGE_DELETE_FAILED
STORAGE_NOT_FOUND
STORAGE_CONNECTION_FAILED
STORAGE_TIMEOUT
```

---

# 49. STORAGE_UPLOAD_FAILED

R2へのUploadに失敗した場合。

---

# 50. STORAGE_DOWNLOAD_FAILED

R2から画像を取得できなかった場合。

---

# 51. STORAGE_DELETE_FAILED

R2から画像を削除できなかった場合。

---

# 52. STORAGE_NOT_FOUND

指定されたStorage Objectが存在しない場合。

---

# 53. STORAGE_CONNECTION_FAILED

R2との通信自体に失敗した場合。

---

# 54. STORAGE_TIMEOUT

R2との通信がTimeoutした場合。

---

# 55. Storage Retry

Storageの一時的なエラーについてはRetryを行う。

対象：

```text
Timeout
Temporary Network Error
Temporary R2 Error
```

対象外：

```text
Invalid Request
Object Not Found
Invalid Credentials
```

---

# 56. Retry回数

Retry回数は有限にする。

基本方針：

```text
Initial Request
 ↓
Retry 1
 ↓
Retry 2
 ↓
Retry 3
 ↓
Failure
```

具体的な回数は実装時に設定する。

---

# 57. Exponential Backoff

Retryする場合はExponential Backoffを利用する。

概念：

```text
Retry 1
↓
短い待機

Retry 2
↓
より長い待機

Retry 3
↓
さらに長い待機
```

短時間に大量のRequestを発生させない。

---

# 58. Network Error

FrontendとBackend間の通信に失敗した場合。

例：

```text
Network Offline
Timeout
Connection Reset
Server Unavailable
```

---

# 59. Frontend Network Error

Frontendでは、HTTP Responseそのものが取得できない場合をNetwork Errorとして扱う。

ユーザーメッセージ：

```text
「サーバーとの通信に失敗しました。通信環境を確認して再度お試しください。」
```

---

# 60. API Timeout

API Requestが一定時間以内に完了しない場合はTimeoutとする。

Frontend：

```text
API Timeout
 ↓
Retry可能な状態
```

とする。

---

# 61. Retry Button

ユーザーが再試行可能なエラーでは、

```text
再試行
```

ボタンを表示する。

例：

```text
「画像の処理に失敗しました。」

[再試行]
```

---

# 62. Retry不可能なエラー

入力値が原因の場合は、単純なRetryを表示しない。

例：

```text
FILE_TOO_LARGE
INVALID_PALETTE
UNSUPPORTED_IMAGE_FORMAT
```

この場合は、

```text
「画像を変更してください。」
```

などの修正方法を案内する。

---

# 63. Error Message

Error Messageはユーザー視点で記述する。

悪い例：

```text
PIL.UnidentifiedImageError
```

良い例：

```text
「画像を読み込めませんでした。対応している画像を選択してください。」
```

---

# 64. Technical Errorを公開しない

以下をFrontendへ返さない。

```text
Stack Trace
Python Exception
File Path
R2 Endpoint
Access Key
Database Error
内部SQL
```

---

# 65. Internal Error

Internal Errorの詳細はBackend Logへ記録する。

ユーザーには、

```text
「予期しないエラーが発生しました。」
```

などの一般的なメッセージを返す。

---

# 66. Error Logging

Error Logには可能な限り以下を記録する。

```text
timestamp
requestId
errorCode
HTTP Status
endpoint
method
imageId
processingTime
exceptionType
stackTrace
```

---

# 67. Logging禁止情報

以下はLogへ出力しない。

```text
R2 Secret
Access Key
Authorization Token
Password
Cookie
画像Binary
個人情報
```

---

# 68. Image Data

画像そのものをError Logへ保存しない。

必要な場合でも、

```text
imageId
hash
metadata
```

などを利用する。

---

# 69. Request IDとLog

API Response：

```json
{
  "error": {
    "code": "IMAGE_PROCESSING_FAILED",
    "message": "画像の処理に失敗しました。",
    "requestId": "abc..."
  }
}
```

Backend Log：

```text
requestId=abc...
errorCode=IMAGE_PROCESSING_FAILED
exception=...
stackTrace=...
```

このようにRequest IDで紐付ける。

---

# 70. Frontend Error Handler

FrontendではAPI Errorを共通Handlerで処理する。

概念：

```text
API Response
      ↓
Error Parser
      ↓
Error Code
      ↓
UI Message
```

---

# 71. Error Mapping

FrontendではError Codeと表示メッセージを対応付ける。

例：

```text
INVALID_FILE
↓
「ファイルを確認してください。」

FILE_TOO_LARGE
↓
「ファイルサイズが大きすぎます。」

UNSUPPORTED_IMAGE_FORMAT
↓
「対応していない画像形式です。」

IMAGE_PROCESSING_FAILED
↓
「画像の処理に失敗しました。」
```

---

# 72. Error Messageの責務

BackendのmessageをそのままUIへ表示することを必須としない。

Frontend側でError Codeから表示文言を決定できる設計を基本とする。

理由：

- UI文言をFrontendで管理できる
- 多言語化しやすい
- Backend内部メッセージを公開しにくい

---

# 73. Unknown Error Code

Frontendが未知のError Codeを受信した場合：

```text
UNKNOWN_ERROR
```

として扱う。

ユーザーには、

```text
「予期しないエラーが発生しました。」
```

を表示する。

---

# 74. Error Boundary

React Router / Reactアプリケーションでは、予期しないRender Errorを捕捉するためError Boundaryを使用する。

対象：

```text
Component Render Error
Unexpected UI Error
```

---

# 75. Error Boundaryの表示

Error Boundaryでは、

```text
問題が発生しました。

ページを再読み込みしてください。

[再読み込み]
```

などのFallback UIを表示する。

---

# 76. API ErrorとRender Errorの分離

以下は別々に扱う。

```text
API Error
↓
API Error Handler

Render Error
↓
Error Boundary
```

---

# 77. Form Validation Error

Editor画面などの入力値Validationでは、可能な限り入力項目の近くにエラーを表示する。

例：

```text
Primary Color
[ #123456 ]

Ratio
[ 60 ]

                ↑
「0〜100の範囲で入力してください。」
```

---

# 78. Global Error

画面全体に影響するエラーはToastやAlertなどで通知する。

例：

```text
「画像の保存に失敗しました。」
```

---

# 79. Inline Error

入力値そのものに問題がある場合はInline Errorを使用する。

例：

```text
Accent Color
[ #GGGGGG ]

「正しいカラーコードを入力してください。」
```

---

# 80. Error UIの原則

エラー表示では以下を意識する。

- 何が起きたか
- 何をすればよいか
- 再試行できるか

を可能な限り明確にする。

---

# 81. エラー表示例

## ファイルサイズ超過

```text
ファイルサイズが大きすぎます。

より小さい画像を選択してください。
```

---

## 非対応形式

```text
この画像形式には対応していません。

JPEG、PNG、WebPなどの画像を使用してください。
```

---

## Processing Error

```text
画像の処理に失敗しました。

もう一度お試しください。

[再試行]
```

---

# 82. Error Toast

短時間で消えるToastは、重要度が低いエラーに使用する。

例：

```text
設定を保存できませんでした。
```

ただし、ユーザーが操作を継続できない重大なエラーはModalやError Panelを使用する。

---

# 83. Error Modal

重大なエラーではModalを使用できる。

例：

```text
画像の処理に失敗しました

画像を処理できませんでした。
もう一度お試しください。

[閉じる] [再試行]
```

---

# 84. Loading中のError

画像処理中にエラーが発生した場合、

```text
Loading
 ↓
Error
```

へ状態を変更する。

Loading UIを表示し続けない。

---

# 85. Editor State

Editorでは最低限以下の状態を管理する。

```text
idle
uploading
processing
success
error
```

概念：

```text
idle
 ↓
uploading
 ↓
processing
 ↓
success
```

エラー：

```text
uploading
 ↓
error

processing
 ↓
error
```

---

# 86. Error Recovery

ErrorからRecoveryできる場合は、

```text
error
 ↓
retry
 ↓
processing
```

へ戻す。

---

# 87. Upload Error Recovery

Upload Errorの場合：

```text
Upload
 ↓
Error
 ↓
ユーザーが再選択
 ↓
Upload
```

---

# 88. Processing Error Recovery

Processing Errorの場合：

```text
Processing
 ↓
Error
 ↓
Retry
 ↓
Processing
```

---

# 89. Storage Error Recovery

一時的なStorage Error：

```text
Storage Error
 ↓
Retry
 ↓
Success
```

恒久的なStorage Error：

```text
Storage Error
 ↓
User Notification
 ↓
処理終了
```

---

# 90. Cleanup on Error

処理途中でエラーが発生した場合、一時ファイルや不要ObjectをCleanupする。

例：

```text
Original Upload
 ↓
Processing
 ↓
Error
 ↓
Temporary File Delete
```

必要に応じてR2上の不要Objectも削除する。

---

# 91. Transaction-like Processing

画像処理では、できるだけ中途半端な状態を残さない。

基本：

```text
Original
 ↓
Processing
 ↓
Output Validation
 ↓
Processed Upload
```

Output Validationに失敗した場合、Processedを保存しない。

---

# 92. Partial Failure

以下のような状態を想定する。

```text
Original Upload Success
Processed Generation Success
Processed Upload Failure
```

この場合、

```text
Original
```

は残っている可能性がある。

再処理可能な状態として扱う。

---

# 93. Idempotency

同じ処理を複数回実行しても、致命的な副作用が発生しないようにする。

例えば、

```text
Processing Retry
```

によってProcessed Imageが壊れたり、不要な大量Objectが生成されたりしない設計を目指す。

---

# 94. Duplicate Processing

同一Requestの重複送信が発生する可能性がある。

例：

```text
ユーザーがボタンを連打
```

対策：

- FrontendでButtonをDisable
- Processing中は再実行不可
- Backendでも必要に応じて重複Requestを制御

---

# 95. Button Disable

Processing中：

```text
[処理中...]
```

として、同じ処理を複数回実行できないようにする。

---

# 96. Rate Limit

画像処理APIにはRate Limitを設ける。

理由：

```text
大量Upload
大量Processing
API Abuse
```

を防止するため。

---

# 97. Rate Limit Error

Rate Limit超過時：

```text
HTTP 429
```

Error Code：

```text
RATE_LIMIT_EXCEEDED
```

ユーザーメッセージ：

```text
「短時間に多くのリクエストが送信されています。少し時間をおいてお試しください。」
```

---

# 98. Timeout

画像処理にはTimeoutを設定する。

対象：

```text
Image Processing
Storage
External API
```

---

# 99. Processing Timeout

処理が長時間終了しない場合：

```text
PROCESSING_TIMEOUT
```

として扱う。

HTTP：

```text
504
```

または処理APIの仕様に応じたStatus Codeを使用する。

---

# 100. Memory Error

高解像度画像などによってMemory不足が発生した場合、内部でErrorとして捕捉する。

ユーザーには、

```text
「画像のサイズが大きすぎるため処理できませんでした。」
```

などのメッセージを返す。

可能な限りサーバー自体をCrashさせない。

---

# 101. Unexpected Exception

予期しないExceptionはGlobal Exception Handlerで捕捉する。

概念：

```text
Unexpected Exception
 ↓
Global Handler
 ↓
Log
 ↓
requestId
 ↓
HTTP 500
```

---

# 102. Global Exception Handler

FastAPI側でGlobal Exception Handlerを設定する。

役割：

- Unexpected Exceptionの捕捉
- Log出力
- Request IDの付与
- 統一Error Response
- HTTP 500 Response

---

# 103. Exceptionの詳細

開発環境ではDebug情報を確認できるようにする。

Productionでは内部Exceptionの詳細をユーザーへ返さない。

---

# 104. Development Error

Developmentでは、

```text
Stack Trace
Exception
Request ID
```

などを開発者が確認できるようにする。

ただし、Frontendへ機密情報を返す設計にはしない。

---

# 105. Production Error

Productionでは、

```text
Generic Message
+
Request ID
```

を基本とする。

例：

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "予期しないエラーが発生しました。",
    "requestId": "..."
  }
}
```

---

# 106. Error Monitoring

将来的にSentryなどのError Monitoring Serviceを導入することを検討する。

対象：

```text
Backend Exception
Frontend Exception
API Error
Performance Issue
```

MVPでは必須としない。

---

# 107. Error Monitoringと個人情報

Error Monitoring Serviceへ送信する情報には注意する。

以下を可能な限り送信しない。

```text
画像Binary
Access Token
Password
R2 Secret
個人情報
```

---

# 108. Logging Level

基本的なLog Level：

```text
DEBUG
INFO
WARNING
ERROR
CRITICAL
```

---

# 109. DEBUG

開発中の詳細なデバッグ情報。

Productionでは必要最小限にする。

---

# 110. INFO

正常な処理に関する情報。

例：

```text
Image Processing Started
Image Processing Completed
```

---

# 111. WARNING

処理は継続できるが注意が必要な状態。

例：

```text
Retry occurred
Fallback applied
```

---

# 112. ERROR

処理が失敗した状態。

例：

```text
Image Processing Failed
Storage Upload Failed
```

---

# 113. CRITICAL

システム全体に影響する重大な問題。

例：

```text
Database unavailable
Configuration failure
```

---

# 114. Error Code一覧

MVPでは以下を基本とする。

| Error Code                 |    HTTP | 説明                     |
| -------------------------- | ------: | ------------------------ |
| INVALID_FILE               | 400/422 | 不正なファイル           |
| FILE_TOO_LARGE             |     413 | ファイルサイズ超過       |
| IMAGE_DIMENSIONS_TOO_LARGE | 413/422 | 画像サイズ超過           |
| UNSUPPORTED_IMAGE_FORMAT   |     415 | 非対応画像形式           |
| IMAGE_DECODE_FAILED        |     422 | Decode失敗               |
| INVALID_COLOR              |     422 | Color値が不正            |
| INVALID_PALETTE            |     422 | Paletteが不正            |
| INVALID_RATIO              |     422 | Ratioが不正              |
| INVALID_STRENGTH           |     422 | Strengthが不正           |
| IMAGE_NOT_FOUND            |     404 | 画像が存在しない         |
| IMAGE_PROCESSING_FAILED    |     500 | 画像処理失敗             |
| IMAGE_TRANSFORM_FAILED     |     500 | Transformation失敗       |
| IMAGE_ENCODE_FAILED        |     500 | Encode失敗               |
| COLOR_ANALYSIS_FAILED      |     500 | Color Analysis失敗       |
| COLOR_MATCHING_FAILED      |     500 | Color Matching失敗       |
| COLOR_TRANSFORM_FAILED     |     500 | Color Transform失敗      |
| COLOR_GAMUT_MAPPING_FAILED |     500 | Gamut Mapping失敗        |
| STORAGE_UPLOAD_FAILED      | 502/503 | Storage Upload失敗       |
| STORAGE_DOWNLOAD_FAILED    | 502/503 | Storage Download失敗     |
| STORAGE_DELETE_FAILED      | 502/503 | Storage Delete失敗       |
| STORAGE_NOT_FOUND          |     404 | Storage Object不存在     |
| STORAGE_CONNECTION_FAILED  |     503 | Storage接続失敗          |
| STORAGE_TIMEOUT            |     504 | Storage Timeout          |
| PROCESSING_TIMEOUT         |     504 | Image Processing Timeout |
| RATE_LIMIT_EXCEEDED        |     429 | Rate Limit超過           |
| INTERNAL_SERVER_ERROR      |     500 | 予期しないエラー         |

---

# 115. Error CodeとHTTP Status

Error CodeとHTTP Statusは別概念として扱う。

```text
Error Code
↓
アプリケーション固有の意味

HTTP Status
↓
HTTP通信上の意味
```

例えば、

```text
STORAGE_TIMEOUT
```

は、

```text
HTTP 504
```

として返す。

---

# 116. API Error Schema

APIのError Responseは可能な限り統一する。

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けメッセージ",
    "requestId": "REQUEST_ID"
  }
}
```

---

# 117. Validation Errorの詳細

複数の入力値が不正な場合、必要に応じてField Errorを返す。

例：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容を確認してください。",
    "requestId": "..."
  },
  "fields": {
    "primaryColor": "カラーコードが不正です。",
    "primaryRatio": "0〜100の範囲で入力してください。"
  }
}
```

---

# 118. Field Error

FrontendではField Errorを該当Inputの近くへ表示する。

```text
Primary Color

[ #GGGGGG ]

カラーコードが不正です。
```

---

# 119. Error State

Frontendの主要State：

```text
idle
uploading
processing
success
error
```

Error Stateでは、

```text
errorCode
message
requestId
retryable
```

などを保持できる。

---

# 120. Retryable

ErrorにはRetry可能かどうかを判断できる情報を持たせる。

概念：

```text
retryable = true
```

または

```text
retryable = false
```

ただし、FrontendがError Codeから判断する方式でもよい。

---

# 121. Retryable Error

代表例：

```text
NETWORK_ERROR
STORAGE_TIMEOUT
STORAGE_CONNECTION_FAILED
PROCESSING_TIMEOUT
```

---

# 122. Non-Retryable Error

代表例：

```text
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_IMAGE_FORMAT
INVALID_PALETTE
INVALID_RATIO
INVALID_STRENGTH
```

---

# 123. User Action

エラーごとに推奨するUser Actionを定義する。

例：

```text
FILE_TOO_LARGE
↓
画像を小さくする

INVALID_PALETTE
↓
カラーコードを修正する

PROCESSING_TIMEOUT
↓
再試行する

STORAGE_TIMEOUT
↓
少し待って再試行する
```

---

# 124. エラー表示の優先順位

ユーザーへのエラー表示では、

```text
1. 何が起きたか
2. 原因
3. どうすればよいか
4. 再試行できるか
```

の順で伝える。

---

# 125. エラー表示を避ける例

以下のような表示は避ける。

```text
500 Internal Server Error
```

```text
PIL.Image.DecompressionBombError
```

```text
R2 PutObject failed
```

ユーザーには技術的な詳細を見せない。

---

# 126. API Errorの例

Request：

```http
POST /api/images/process
```

Error：

```http
HTTP/1.1 413 Payload Too Large
```

Response：

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "ファイルサイズが大きすぎます。",
    "requestId": "7f3d9a1c-..."
  }
}
```

---

# 127. Processing Errorの例

```http
HTTP/1.1 500 Internal Server Error
```

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

# 128. Storage Errorの例

```http
HTTP/1.1 503 Service Unavailable
```

```json
{
  "error": {
    "code": "STORAGE_CONNECTION_FAILED",
    "message": "画像を保存できませんでした。時間をおいて再度お試しください。",
    "requestId": "..."
  }
}
```

---

# 129. Unknown Errorの例

```http
HTTP/1.1 500 Internal Server Error
```

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "予期しないエラーが発生しました。時間をおいて再度お試しください。",
    "requestId": "..."
  }
}
```

---

# 130. Error Handling Architecture

全体構成：

```text
                    ┌───────────────┐
                    │   Frontend    │
                    └───────┬───────┘
                            │
                     API Error Handler
                            │
                            ↓
                    ┌───────────────┐
                    │    FastAPI    │
                    └───────┬───────┘
                            │
                    Global Exception
                         Handler
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        Validation      Processing      Storage
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                       Error Code
                            ↓
                       API Response
```

---

# 131. Backend Error Layer

Backendでは以下のLayerでErrorを扱う。

```text
Router
 ↓
Service
 ↓
Domain / Processing
 ↓
Infrastructure
```

低レイヤーのExceptionをそのままRouterまで伝播させず、適切なDomain Errorへ変換する。

---

# 132. Domain Error

アプリケーション固有のErrorを定義する。

概念：

```python
class ColorFitError(Exception):
    code: str
```

例えば、

```python
class ImageProcessingError(ColorFitError):
    code = "IMAGE_PROCESSING_FAILED"
```

など。

---

# 133. Infrastructure Error

R2などの外部Infrastructureで発生したExceptionは、Storage LayerでColorFit固有のErrorへ変換する。

```text
R2 Exception
 ↓
Storage Layer
 ↓
STORAGE_UPLOAD_FAILED
```

---

# 134. Processing Error

Pillow / NumPyなどのLibrary Exceptionを、そのままAPI Responseへ返さない。

```text
Library Exception
 ↓
Processing Layer
 ↓
ColorFit Error
 ↓
API Error
```

---

# 135. Exception Chaining

内部ログでは元のExceptionを保持して、原因を追跡できるようにする。

概念：

```text
ColorFitError
    caused by
Pillow Exception
```

ただし、元Exceptionをユーザーへ返さない。

---

# 136. Error BoundaryとAPI Handler

Frontendでは、

```text
API Error
```

と

```text
Unexpected Render Error
```

を分離する。

```text
API Error
 ↓
API Error Handler

Render Error
 ↓
React Error Boundary
```

---

# 137. Error Logging Middleware

BackendではMiddlewareなどを利用してRequest IDを管理する。

概念：

```text
Request
 ↓
Request ID生成
 ↓
API
 ↓
Error
 ↓
Log
```

---

# 138. Request ID Header

必要に応じてResponse HeaderにもRequest IDを含める。

例：

```text
X-Request-ID: xxxxxxxx
```

API BodyにもRequest IDを含める。

---

# 139. Error Response Header

Error Responseでは、

```text
X-Request-ID
```

を返すことを検討する。

これによりユーザーや開発者がエラーを追跡しやすくなる。

---

# 140. Security

Error Handlingでは情報漏洩を防止する。

禁止：

```text
Stack Trace
Server Path
Environment Variables
R2 Credentials
Database Credentials
Internal IP
SQL
```

---

# 141. User Privacy

エラーメッセージへユーザーの画像内容を含めない。

悪い例：

```text
「mshrynzw_2026_private_photo.jpgを処理できませんでした。」
```

必要がなければファイル名も表示しない。

---

# 142. Error Monitoring

Productionでは、重要なUnexpected Errorを監視する。

最低限確認したい情報：

```text
Error Code
Endpoint
Request ID
Timestamp
Exception Type
Processing Time
```

---

# 143. Error Rate

将来的に以下のError Rateを監視する。

```text
Upload Error Rate
Processing Error Rate
Storage Error Rate
API Error Rate
Frontend Error Rate
```

---

# 144. Performance Error

処理時間が異常に長い場合、単純なエラーだけでなくPerformance Issueとして扱う。

例：

```text
Processing Time > Threshold
```

の場合、Warning Logを出力する。

---

# 145. Fallback

可能な処理についてはFallbackを用意する。

例：

```text
CIEDE2000
 ↓
計算失敗
 ↓
簡易Color Distance
```

ただし、Fallbackによって品質が大きく低下する場合は処理を失敗させる。

Fallbackは無条件に使用しない。

---

# 146. Color Matching Fallback

Color Matchingでは、

```text
Advanced Matching
 ↓
Failure
```

した場合に、より単純なMatchingへFallbackする方式を将来的に検討する。

MVPでは無理に実装しない。

---

# 147. Storage Fallback

R2障害時に別Storageへ自動切り替えする仕組みはMVPでは実装しない。

理由：

- システムが複雑になる
- データ整合性が難しくなる
- ポートフォリオとして過剰設計になる

---

# 148. Error HandlingとUX

エラー処理は単にExceptionを捕捉するだけではなく、

```text
Error
 ↓
User Understanding
 ↓
Recovery
```

までを設計する。

---

# 149. EditorでのError UX

Editor画面では、処理失敗時も現在の入力状態を可能な限り保持する。

例えば、

```text
Palette
Primary   #123456
Secondary #456789
Accent    #E0A458

Strength 70%
```

などを失わないようにする。

---

# 150. 入力状態の保持

API Errorが発生しても、FrontendのForm StateをすべてResetしない。

```text
Error
 ↓
入力値保持
 ↓
再試行
```

を基本とする。

---

# 151. Upload Error時の入力状態

Upload Errorが発生した場合、Paletteや設定値は可能な限り保持する。

ユーザーがすべて入力し直す必要がないUXを目指す。

---

# 152. Processing Error時の入力状態

Processing Errorが発生した場合、現在のAdjustment設定を保持する。

```text
Strength
Temperature
Saturation
```

など。

---

# 153. Error Recovery Flow

基本：

```text
Error
 ↓
原因表示
 ↓
入力修正 or Retry
 ↓
再処理
 ↓
Success
```

---

# 154. Error Handling Test

最低限、以下をテストする。

### File

- [ ] 空ファイル
- [ ] 非対応形式
- [ ] 破損画像
- [ ] 大容量画像
- [ ] 巨大解像度画像

### Palette

- [ ] 不正HEX
- [ ] Ratio合計不正
- [ ] Strength範囲外

### Storage

- [ ] Upload失敗
- [ ] Download失敗
- [ ] Delete失敗
- [ ] Timeout
- [ ] Not Found

### Processing

- [ ] Decode失敗
- [ ] Transform失敗
- [ ] Encode失敗
- [ ] Timeout
- [ ] Memory Error

### Frontend

- [ ] API Error
- [ ] Network Error
- [ ] Timeout
- [ ] Unknown Error
- [ ] Render Error

---

# 155. Error Response Test

すべてのAPI Error Responseが、

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "requestId": "..."
  }
}
```

という基本構造を維持していることを確認する。

---

# 156. Security Test

以下を確認する。

- [ ] Stack TraceがResponseへ含まれない
- [ ] SecretがResponseへ含まれない
- [ ] SecretがLogへ含まれない
- [ ] TokenがLogへ含まれない
- [ ] Server PathがResponseへ含まれない
- [ ] SQLなどの内部情報がResponseへ含まれない
- [ ] 画像BinaryがLogへ出力されない

---

# 157. Regression Test

Error Handlingを変更した場合、既存のError Caseを再実行する。

特に、

```text
Validation
Processing
Storage
API
Frontend
```

を横断して確認する。

---

# 158. Error Handlingの実装原則

以下を実装原則とする。

1. Error Codeを利用する。
2. HTTP Status Codeを適切に設定する。
3. API Error Responseを統一する。
4. Request IDを利用する。
5. BackendのExceptionをユーザーへ直接返さない。
6. FrontendではError Codeを基準に処理する。
7. 入力エラーはInline Errorを優先する。
8. システムエラーはToast / Alert / Error Panelなどを利用する。
9. Retry可能なエラーにはRetry UIを提供する。
10. Retry不可能なエラーには修正方法を提示する。
11. Processing中は重複操作を防止する。
12. 一時ファイルをエラー時にCleanupする。
13. Storageエラーには限定的なRetryを行う。
14. Unexpected ErrorをGlobal Handlerで捕捉する。
15. Stack TraceをProduction Responseへ返さない。
16. Secretや個人情報をLogへ出さない。
17. Error Monitoringを将来的に導入できる設計にする。
18. Error HandlingとBusiness Logicを分離する。
19. Frontend ErrorとBackend Errorを分離する。
20. エラーから正常状態へRecoveryできる設計を優先する。

---

# 159. 完了条件

Error Handling詳細設計は以下を満たすことを完了条件とする。

- [ ] エラー分類が定義されている
- [ ] Error Code命名規則が定義されている
- [ ] API Error Responseが定義されている
- [ ] Request IDが定義されている
- [ ] HTTP Status Codeが定義されている
- [ ] File Validation Errorが定義されている
- [ ] Palette Validation Errorが定義されている
- [ ] Image Processing Errorが定義されている
- [ ] Color Matching Errorが定義されている
- [ ] Storage Errorが定義されている
- [ ] Network Errorが定義されている
- [ ] Rate Limit Errorが定義されている
- [ ] Unexpected Errorが定義されている
- [ ] Retry方針が定義されている
- [ ] Exponential Backoffの方針が定義されている
- [ ] Timeout方針が定義されている
- [ ] Frontend Error Handlerが定義されている
- [ ] React Error Boundaryが定義されている
- [ ] Inline Errorの方針が定義されている
- [ ] Toast / Alertの方針が定義されている
- [ ] Error Recoveryが定義されている
- [ ] Error Loggingが定義されている
- [ ] Security方針が定義されている
- [ ] Error Monitoringの方針が定義されている
- [ ] Error Testが定義されている
- [ ] Regression Testが定義されている
