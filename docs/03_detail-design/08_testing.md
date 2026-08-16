# ColorFit テスト詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるテスト方針、テストレベル、テスト対象、テストケース、品質基準および完了条件を定義する。

ColorFitでは、単純なUIテストだけではなく、画像処理・Color Matching・API・Storage・Securityなど、アプリケーション全体を対象としてテストを行う。

---

# 2. テスト基本方針

ColorFitでは以下を基本方針とする。

1. 新機能には可能な限りテストを追加する。
2. Business Logicを重点的にUnit Testする。
3. APIはIntegration Testで検証する。
4. 画像処理は実際の画像を利用して検証する。
5. Color Matchingは計算結果を検証する。
6. Frontendは重要なUser FlowをE2E Testする。
7. Security上重要な処理は専用テストを用意する。
8. Error Handlingも正常系と同様にテストする。
9. Regression Testを継続的に行う。
10. CIで自動実行できるテストを可能な限り自動化する。
11. テストが不安定にならないようにする。
12. 外部サービスへの依存を可能な限りMockする。
13. 本番環境のSecretやユーザー画像をテストに使用しない。
14. テスト結果をCIで確認できる状態にする。

---

# 3. テストの目的

テストによって以下を確認する。

```text
Functional Correctness
        ↓
Performance
        ↓
Security
        ↓
Reliability
        ↓
User Experience
```

具体的には、

- UIが仕様どおり動作する
- APIが正しいResponseを返す
- 不正なInputを拒否する
- 画像を正しく処理できる
- Color Matchingが正しく動作する
- Storageへ正しく保存できる
- エラーを適切に処理できる
- Security上の問題がない
- Responsive Designが崩れない

ことを確認する。

---

# 4. テストレベル

ColorFitでは以下のテストレベルを使用する。

```text
Unit Test
    ↓
Integration Test
    ↓
API Test
    ↓
E2E Test
    ↓
Manual Test
```

さらに、

```text
Security Test
Performance Test
Visual Regression Test
```

を必要に応じて実施する。

---

# 5. テストピラミッド

基本的には以下の構成を目指す。

```text
             ┌──────────────┐
             │    E2E       │
             └──────────────┘
           ┌──────────────────┐
           │ Integration/API  │
           └──────────────────┘
      ┌──────────────────────────┐
      │         Unit Test        │
      └──────────────────────────┘
```

Unit Testを最も多くし、E2E Testは重要なUser Flowに限定する。

---

# 6. Unit Test

Unit Testでは、個々のFunctionやServiceなどを単独でテストする。

対象：

- Color Matching
- Color Conversion
- Ratio Calculation
- Validation
- Image Utility
- Storage Key生成
- Error Mapping
- Utility Function

---

# 7. Unit Testの原則

Unit Testでは可能な限り外部依存を排除する。

例えば、

```text
Color Matching Function
```

をテストする場合、

```text
R2
Database
HTTP
```

などへ接続しない。

---

# 8. Frontend Unit Test

Frontendでは以下をUnit Test対象とする。

```text
Utility Function
Validation
Color Calculation
State Transformation
Error Mapping
```

UI Componentそのものについては必要に応じてComponent Testを使用する。

---

# 9. Backend Unit Test

Backendでは以下をUnit Test対象とする。

```text
Validation
Color Matching
Image Processing Utility
Storage Key Generation
Error Conversion
Business Logic
```

---

# 10. Image Processing Unit Test

Image Processingの各Functionを独立してテストする。

例：

```text
Decode
Resize
Color Conversion
Transform
Encode
Metadata Removal
```

---

# 11. Color Matching Unit Test

Color Matchingは特に重要なUnit Test対象とする。

対象：

```text
Color Distance
Palette Matching
Color Mapping
Ratio
Strength
Color Transform
```

---

# 12. Validation Unit Test

以下をテストする。

```text
Valid Input
Invalid Input
Boundary Value
Null
Empty
Wrong Type
Out of Range
```

---

# 13. Boundary Value Test

境界値を重点的にテストする。

例：

```text
0
1
100
MAX
MAX + 1
```

File Sizeについても、

```text
MAX_FILE_SIZE - 1
MAX_FILE_SIZE
MAX_FILE_SIZE + 1
```

などを確認する。

---

# 14. Integration Test

Integration Testでは複数のComponentを組み合わせてテストする。

例：

```text
API
 ↓
Service
 ↓
Image Processing
```

など。

---

# 15. Backend Integration Test

Backendでは以下のFlowをIntegration Testする。

```text
Request
 ↓
Validation
 ↓
Service
 ↓
Processing
 ↓
Response
```

---

# 16. API Test

API EndpointについてRequest / Responseを検証する。

対象：

```text
Upload API
Processing API
Result API
Download API
Delete API
```

実際のEndpointは `06_api.md` に定義されたAPI仕様と一致させる。

---

# 17. API Testの確認項目

各APIについて以下を確認する。

```text
HTTP Method
Status Code
Request Schema
Response Schema
Validation
Error Response
Authentication
Authorization
Rate Limit
```

---

# 18. API正常系テスト

正常なRequestを送信して、

```text
HTTP 2xx
```

が返ることを確認する。

Response Bodyも仕様と一致することを確認する。

---

# 19. API異常系テスト

不正なRequestを送信して適切なError Responseが返ることを確認する。

例：

```text
400
404
413
415
422
429
500
503
504
```

---

# 20. API Error Schema Test

Error Responseが以下の形式を維持していることを確認する。

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "requestId": "REQUEST_ID"
  }
}
```

---

# 21. Request ID Test

Error発生時にRequest IDが生成されることを確認する。

さらに、

```text
API Response
```

と

```text
Backend Log
```

のRequest IDが一致することを確認する。

---

# 22. File Upload Test

Upload APIでは以下をテストする。

### 正常系

- [ ] JPEG
- [ ] PNG
- [ ] WebP
- [ ] 正常なファイルサイズ
- [ ] 正常な解像度

### 異常系

- [ ] 空ファイル
- [ ] 非画像ファイル
- [ ] 破損画像
- [ ] 大容量ファイル
- [ ] 巨大解像度
- [ ] Pixel数超過
- [ ] MIME偽装
- [ ] 拡張子偽装

---

# 23. Image Format Test

対応画像形式ごとにテストする。

例：

```text
JPEG
PNG
WebP
```

各形式について、

```text
Upload
 ↓
Decode
 ↓
Processing
 ↓
Encode
```

が成功することを確認する。

---

# 24. Unsupported Format Test

非対応形式をUploadする。

例：

```text
GIF
SVG
PDF
TXT
ZIP
EXE
```

など。

対応形式はRequirementsおよびImage Processing設計と一致させる。

---

# 25. File Size Test

以下をテストする。

```text
MAX_FILE_SIZE - 1
MAX_FILE_SIZE
MAX_FILE_SIZE + 1
```

期待結果：

```text
MAX以下
↓
Success

MAX超過
↓
FILE_TOO_LARGE
```

---

# 26. Image Dimension Test

以下をテストする。

```text
MAX_WIDTH - 1
MAX_WIDTH
MAX_WIDTH + 1

MAX_HEIGHT - 1
MAX_HEIGHT
MAX_HEIGHT + 1
```

---

# 27. Pixel Count Test

総Pixel数の境界値を確認する。

```text
MAX_PIXEL_COUNT - 1
MAX_PIXEL_COUNT
MAX_PIXEL_COUNT + 1
```

---

# 28. Corrupted Image Test

破損した画像ファイルをUploadする。

期待結果：

```text
IMAGE_DECODE_FAILED
```

などの適切なErrorが返ること。

---

# 29. Fake Extension Test

例えば、

```text
malicious.exe
```

を、

```text
malicious.jpg
```

へRenameしたファイルをUploadする。

実際のFile Signature / Decodeによって拒否されることを確認する。

---

# 30. MIME Type Spoofing Test

MIME Typeだけを、

```text
image/jpeg
```

などに偽装したファイルをUploadする。

MIME Typeだけで許可されないことを確認する。

---

# 31. Image Decode Test

正常画像：

```text
Decode Success
```

破損画像：

```text
Decode Failure
```

となることを確認する。

---

# 32. Metadata Test

画像にEXIF情報が存在する場合、Processed Imageで不要なMetadataが削除されることを確認する。

特にGPS情報を確認する。

---

# 33. Image Re-Encode Test

Input ImageをDecodeして再Encodeした結果、

```text
Valid Image
```

として再びDecodeできることを確認する。

---

# 34. Image Processing Test

Image Processingでは、

```text
Input
 ↓
Decode
 ↓
Processing
 ↓
Transform
 ↓
Encode
 ↓
Output
```

の各段階を確認する。

---

# 35. Processing Success Test

正常画像に対して処理を行い、

```text
Processing Success
```

となることを確認する。

---

# 36. Processing Error Test

意図的に処理失敗条件を作り、

```text
IMAGE_PROCESSING_FAILED
```

などが適切に返ることを確認する。

---

# 37. Processing Timeout Test

処理を意図的に長時間化させ、

```text
PROCESSING_TIMEOUT
```

が適切に処理されることを確認する。

---

# 38. Memory Protection Test

巨大画像などを使用し、

```text
Memory Usage
```

が異常に増加した場合でもApplication全体が不安定にならないことを確認する。

---

# 39. Color Matching Test

Color MatchingはColorFitのCore Featureであるため、重点的にテストする。

対象：

```text
Palette
Ratio
Strength
Color Distance
Color Mapping
```

---

# 40. Color Matching正常系

例：

```text
Input Image
Palette:
  Primary   #123456
  Secondary #789ABC
  Accent    #DEF012

Ratio:
  60 / 30 / 10

Strength:
  0.7
```

について、処理が成功することを確認する。

---

# 41. Color Matching境界値

Strengthについて、

```text
0
0.01
0.5
0.99
1
```

などをテストする。

---

# 42. Strength Validation Test

以下を拒否する。

```text
-0.1
1.1
NaN
Infinity
```

---

# 43. Palette Validation Test

以下をテストする。

### 正常

```text
60 / 30 / 10
```

### 異常

```text
60 / 30 / 30
```

合計：

```text
120
```

---

# 44. Color Format Test

正常：

```text
#FFFFFF
#000000
#123456
```

異常：

```text
FFFFFF
#GGGGGG
#12345
#1234567
```

などをテストする。

---

# 45. Color Distance Test

Color Distance Functionについて既知の入力値と期待値を比較する。

誤差が発生するアルゴリズムの場合は許容誤差を定義する。

---

# 46. Color Transformation Test

Transformation前後で、

```text
Output Image
```

が有効な画像として生成されることを確認する。

---

# 47. Color Matching Quality Test

Color Matchingでは、単純なUnit Testだけではなく、実画像を利用した品質確認を行う。

例：

```text
Original
↓
Color Matching
↓
Result
```

について、

- Primary Colorに近づいているか
- Secondary Colorが適切に反映されているか
- Accent Colorが過剰になっていないか
- 元画像の構造が維持されているか

などを確認する。

---

# 48. Golden Image Test

重要な画像処理結果について、基準画像を用意して比較する方式を検討する。

概念：

```text
Input Image
      ↓
Processing
      ↓
Generated Image
      ↓
Golden Image
      ↓
Comparison
```

---

# 49. Golden Image Testの注意

画像処理では、

```text
Library Version
Color Profile
Platform
Compression
```

などによってPixel単位の完全一致が難しい場合がある。

そのため、必要に応じて、

```text
Pixel Difference
PSNR
SSIM
Color Difference
```

などを利用する。

---

# 50. Storage Test

StorageではR2とのIntegrationを確認する。

対象：

```text
Upload
Download
Delete
Exists
```

---

# 51. Storage Upload Test

画像をR2へUploadし、Objectが正常に作成されることを確認する。

---

# 52. Storage Download Test

保存したObjectをDownloadし、元の処理対象画像と一致することを確認する。

---

# 53. Storage Delete Test

ObjectをDeleteし、Objectが存在しなくなることを確認する。

---

# 54. Storage Not Found Test

存在しないObjectへアクセスし、

```text
STORAGE_NOT_FOUND
```

などの適切なErrorが返ることを確認する。

---

# 55. Storage Timeout Test

StorageへのRequestを意図的にTimeoutさせ、

```text
STORAGE_TIMEOUT
```

が適切に処理されることを確認する。

---

# 56. Storage Retry Test

一時的なStorage Errorが発生した場合、

```text
Retry
```

が実行されることを確認する。

---

# 57. Storage Retry上限

Retryが無限に実行されないことを確認する。

```text
Request
 ↓
Retry 1
 ↓
Retry 2
 ↓
Retry 3
 ↓
Failure
```

など、定義した最大回数で停止する。

---

# 58. Storage Cleanup Test

Processing Errorが発生した場合、不要なTemporary Objectが残らないことを確認する。

---

# 59. Error Handling Test

Error Handling設計に基づき、各Error Codeをテストする。

最低限：

```text
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_IMAGE_FORMAT
IMAGE_DECODE_FAILED
INVALID_COLOR
INVALID_PALETTE
INVALID_RATIO
INVALID_STRENGTH
IMAGE_NOT_FOUND
IMAGE_PROCESSING_FAILED
COLOR_MATCHING_FAILED
STORAGE_UPLOAD_FAILED
STORAGE_DOWNLOAD_FAILED
STORAGE_DELETE_FAILED
STORAGE_TIMEOUT
PROCESSING_TIMEOUT
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

---

# 60. Retryable Error Test

Retry可能なErrorについて、

```text
Error
 ↓
Retry
 ↓
Success
```

が実行できることを確認する。

---

# 61. Non-Retryable Error Test

Validation Errorなどについて、無意味なRetryが実行されないことを確認する。

例：

```text
FILE_TOO_LARGE
```

に対して、

```text
自動Retry
```

を実行しない。

---

# 62. Error Message Test

ユーザー向けMessageが技術的なExceptionを含んでいないことを確認する。

悪い例：

```text
Pillow.UnidentifiedImageError
```

良い例：

```text
画像を読み込めませんでした。
```

---

# 63. Request ID Test

エラー発生時、

```text
requestId
```

が存在することを確認する。

---

# 64. Security Test

Security設計に基づいてテストする。

対象：

```text
XSS
Path Traversal
File Upload
Rate Limit
CORS
Secret Exposure
Error Disclosure
IDOR
```

---

# 65. XSS Test

以下のような文字列をInputへ入力する。

```text
<script>alert(1)</script>
```

Scriptが実行されないことを確認する。

---

# 66. Path Traversal Test

以下を入力する。

```text
../../secret
../
..\..\secret
```

Storage外のFileへアクセスできないことを確認する。

---

# 67. File Upload Security Test

以下をUploadする。

```text
malicious.exe
script.html
archive.zip
fake.jpg
corrupted.jpg
```

適切に拒否されることを確認する。

---

# 68. Rate Limit Test

短時間に大量Requestを送信する。

期待結果：

```text
HTTP 429
RATE_LIMIT_EXCEEDED
```

---

# 69. CORS Test

許可されていないOriginからRequestする。

期待結果：

```text
Request Rejected
```

---

# 70. Secret Exposure Test

Frontend Buildを確認し、

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

などのSecretが含まれていないことを確認する。

---

# 71. Error Information Disclosure Test

故意にInternal Errorを発生させる。

以下がResponseへ含まれないことを確認する。

```text
Stack Trace
Python Path
R2 Secret
Database Credentials
Internal IP
SQL
```

---

# 72. IDOR Test

認証機能を導入した場合、User AがUser BのImage IDを指定してアクセスできないことを確認する。

---

# 73. Frontend Component Test

重要なUI ComponentについてComponent Testを行う。

対象例：

```text
ImageUploader
PaletteEditor
ColorPicker
RatioEditor
ProcessingButton
ResultPreview
ErrorMessage
LoadingIndicator
```

---

# 74. ImageUploader Test

確認項目：

- [ ] ファイル選択
- [ ] Drag & Drop
- [ ] 対応形式
- [ ] 非対応形式
- [ ] サイズ超過
- [ ] Upload状態
- [ ] Error状態
- [ ] Success状態

---

# 75. PaletteEditor Test

確認項目：

- [ ] Primary Color変更
- [ ] Secondary Color変更
- [ ] Accent Color変更
- [ ] Ratio変更
- [ ] Invalid Color
- [ ] Invalid Ratio
- [ ] Validation Message

---

# 76. Processing Button Test

確認項目：

```text
Idle
 ↓
Click
 ↓
Loading
 ↓
Processing
 ↓
Success
```

または、

```text
Processing
 ↓
Error
```

となることを確認する。

---

# 77. Loading UI Test

Processing中に、

```text
Loading Indicator
```

が表示されることを確認する。

Processing終了後にLoading表示が解除されることを確認する。

---

# 78. Error UI Test

Error発生時に、

```text
Error Message
Retry Button
```

などが適切に表示されることを確認する。

---

# 79. Result UI Test

Processing成功後、

```text
Original Image
Processed Image
```

が正しく表示されることを確認する。

---

# 80. Download Test

Result ImageをDownloadできることを確認する。

確認項目：

- [ ] Download Button
- [ ] 正しいFile
- [ ] 正しいFormat
- [ ] 正しいImage Data

---

# 81. Responsive Test

ColorFitはResponsive Designを前提とする。

以下のViewportで確認する。

```text
Mobile
Tablet
Desktop
Large Desktop
```

---

# 82. Mobile Test

スマートフォンサイズで、

- [ ] Navigation
- [ ] Upload
- [ ] Palette Editor
- [ ] Image Preview
- [ ] Processing
- [ ] Result
- [ ] Error Message

が正常に表示されることを確認する。

---

# 83. Tablet Test

TabletサイズでLayoutが崩れないことを確認する。

---

# 84. Desktop Test

DesktopサイズでUI ReferenceのDesignと一致することを確認する。

---

# 85. Large Desktop Test

大画面で、

```text
過度な横幅
画像の拡大
Text Overflow
```

などが発生しないことを確認する。

---

# 86. Visual Regression Test

UI Referenceと実装画面のVisual差分を必要に応じて確認する。

対象：

```text
Home
Editor
Result
Settings
```

---

# 87. UI Reference

Visual Regressionでは、

```text
docs/ui-reference/
```

に保存されているUI Referenceを基準とする。

---

# 88. Animation Test

ColorFitではAnimationを使用するため、Animationが正常に動作することを確認する。

対象：

```text
Page Transition
Button Animation
Loading Animation
Result Animation
Hover Animation
```

---

# 89. Reduced Motion Test

ユーザーがOS側でReduced Motionを設定している場合、過度なAnimationを抑制できることを確認する。

CSSでは、

```css
@media (prefers-reduced-motion: reduce) {
}
```

などを利用する。

---

# 90. Accessibility Test

最低限以下を確認する。

```text
Keyboard Navigation
Focus
Button Label
Input Label
Alt Text
Contrast
ARIA
```

---

# 91. Keyboard Test

Mouseを使用せず、

```text
Tab
Shift + Tab
Enter
Space
Escape
```

などで主要操作ができることを確認する。

---

# 92. Focus Test

Keyboard操作時に現在FocusされているElementが明確に分かることを確認する。

---

# 93. Image Alt Test

UI上で意味を持つImageには適切なAlt Textを設定する。

装飾Imageの場合は適切に扱う。

---

# 94. Form Accessibility Test

以下を確認する。

```text
Label
Input
Error Message
Focus
Required
```

が適切に関連付けられていること。

---

# 95. E2E Test

E2Eでは実際のUser Flowをテストする。

重要なFlow：

```text
Home
 ↓
Editor
 ↓
Upload
 ↓
Palette Input
 ↓
Processing
 ↓
Result
 ↓
Download
```

---

# 96. E2E Scenario 01

### 画像をアップロードして加工する

```text
1. Homeへアクセス
2. Editorへ移動
3. 画像をUpload
4. Paletteを設定
5. Ratioを設定
6. Processingを実行
7. Resultを確認
```

期待結果：

```text
Processing Success
```

---

# 97. E2E Scenario 02

### 不正画像

```text
1. Editorへ移動
2. 非対応ファイルをUpload
```

期待結果：

```text
Error Message
```

が表示される。

---

# 98. E2E Scenario 03

### 大容量画像

```text
1. Editorへ移動
2. 大容量画像をUpload
```

期待結果：

```text
FILE_TOO_LARGE
```

が表示される。

---

# 99. E2E Scenario 04

### Processing Error

```text
1. 正常画像をUpload
2. Processing
3. Processing Error発生
```

期待結果：

```text
Error UI
Retry Button
```

が表示される。

---

# 100. E2E Scenario 05

### Retry

```text
1. Processing Error
2. Retry
3. Processing
4. Success
```

期待結果：

```text
Result表示
```

---

# 101. E2E Scenario 06

### Download

```text
1. Result表示
2. Download
```

期待結果：

```text
正しい画像がDownloadされる
```

---

# 102. E2E Scenario 07

### Settings

```text
1. Settingsへ移動
2. 設定変更
3. Save
```

期待結果：

```text
設定が正常に保存される
```

---

# 103. E2E Scenario 08

### Responsive

主要User FlowをMobile / Desktopで実行する。

---

# 104. API Mock

E2E / Frontend Testでは必要に応じてAPIをMockする。

理由：

```text
外部サービス
R2
Network
```

などに依存するとテストが不安定になるため。

---

# 105. R2 Mock

Unit / Integration TestではR2への実アクセスを可能な限り避ける。

Storage ServiceをMockする。

実際のR2とのIntegration Testは専用Test Environmentで行う。

---

# 106. Test Environment

Test環境をProductionから分離する。

```text
Development
Test
Production
```

---

# 107. Test Storage

TestではProduction R2 Bucketを使用しない。

例：

```text
colorfit-images-test
```

など、専用Storageを利用する。

---

# 108. Test Data

テストデータは専用データを用意する。

ユーザーの実画像を使用しない。

---

# 109. Test Images

以下のようなテスト画像を用意する。

```text
test-jpeg.jpg
test-png.png
test-webp.webp
test-large.jpg
test-corrupted.jpg
test-exif.jpg
test-transparent.png
```

---

# 110. Test Image Requirements

Test Imageには以下のパターンを含める。

```text
Small
Large
Landscape
Portrait
Square
Transparent
Dark
Bright
High Saturation
Low Saturation
```

---

# 111. Color Test Images

Color Matching用に特徴的な色を持つ画像を用意する。

例：

```text
Red Dominant
Blue Dominant
Green Dominant
Monochrome
Low Saturation
High Saturation
```

---

# 112. Test Data管理

テストデータはRepository内で管理する。

例：

```text
tests/
├── fixtures/
│   ├── images/
│   └── palettes/
```

ただし、ファイルサイズが大きくなる場合は別管理方法を検討する。

---

# 113. Test Naming

Test名は、

```text
[対象] + [条件] + [期待結果]
```

が分かるようにする。

例：

```text
should reject image when file size exceeds limit
```

---

# 114. Unit Test Naming

例：

```text
should return error when ratio exceeds 100
```

```text
should match color to nearest palette color
```

---

# 115. Integration Test Naming

例：

```text
should process uploaded image successfully
```

---

# 116. E2E Test Naming

例：

```text
user can upload image and generate color-matched result
```

---

# 117. Test Isolation

各Testは可能な限り独立して実行できるようにする。

あるTestの実行結果が別Testへ影響しないようにする。

---

# 118. Test Cleanup

Test終了後に、

```text
Temporary File
Test Storage Object
Test Data
```

などをCleanupする。

---

# 119. Flaky Test

同じTestを何度実行しても結果が変わるようなFlaky Testを放置しない。

原因を調査して修正する。

---

# 120. Test Time

テストSuiteが過度に遅くならないようにする。

Unit Testは高速に実行できるようにする。

---

# 121. Parallel Test

独立したUnit Testは可能な限りParallel実行できるようにする。

ただし、共有Resourceを使用するTestでは注意する。

---

# 122. CI Test

GitHub ActionsなどのCIで以下を自動実行する。

```text
Lint
Type Check
Unit Test
Integration Test
Build
```

必要に応じて、

```text
E2E Test
Security Test
```

も実行する。

---

# 123. Pull Request Test

Pull Requestでは最低限、

```text
Lint
Type Check
Unit Test
Build
```

を実行する。

---

# 124. Main Branch Test

Main BranchへのMerge前後で、

```text
Unit Test
Integration Test
Build
```

を確認する。

---

# 125. E2E Testの実行タイミング

E2E Testは実行時間や環境依存を考慮し、

```text
Pull Request
Nightly
Release
```

などの運用を検討する。

MVPでは重要なE2EのみCIへ組み込む。

---

# 126. Build Test

Frontend Buildが正常に完了することを確認する。

例：

```text
pnpm build
```

実際のPackage Managerに合わせる。

---

# 127. Type Check

TypeScriptのType Errorがないことを確認する。

例：

```text
pnpm typecheck
```

実際のScript名はProject構成に合わせる。

---

# 128. Lint

Lint Errorがないことを確認する。

例：

```text
pnpm lint
```

---

# 129. Python Test

BackendではPython Test Frameworkを利用する。

例：

```text
pytest
```

実際のテスト構成に合わせて設定する。

---

# 130. Coverage

Test Coverageを測定する。

対象：

```text
Frontend
Backend
Core Business Logic
```

---

# 131. Coverageの考え方

Coverageの数字だけを品質基準にしない。

重要なのは、

```text
Critical Business Logic
```

がテストされていることである。

---

# 132. Critical Logic

高いTest Coverageを優先する対象：

```text
Color Matching
Image Processing
Validation
Storage Logic
Security Logic
Error Handling
```

---

# 133. Coverage目標

MVPでは、重要なBusiness Logicについて十分なCoverageを確保する。

具体的なCoverage Percentageは、実装規模を見ながら決定する。

Coverage 100%を必須条件とはしない。

---

# 134. Regression Test

Bugを修正した場合、同じBugが再発しないようRegression Testを追加する。

基本：

```text
Bug Found
 ↓
Fix
 ↓
Regression Test
 ↓
CI
```

---

# 135. Bug Test

Bug Reportには可能な限り、

```text
Reproduction Steps
Expected Result
Actual Result
Environment
Request ID
```

を記録する。

---

# 136. Performance Test

画像処理のPerformanceを測定する。

対象：

```text
Upload
Decode
Color Analysis
Color Matching
Transform
Encode
Storage Upload
```

---

# 137. Processing Time

画像処理時間を測定する。

例：

```text
Small Image
Medium Image
Large Image
```

ごとに比較する。

---

# 138. Performance Regression

Image Processing Algorithmを変更した場合、以前より大幅に処理時間が増加していないか確認する。

---

# 139. Load Test

将来的にLoad Testを実施する。

対象：

```text
Concurrent Upload
Concurrent Processing
API Requests
```

---

# 140. Load Testの注意

Production環境へ無許可でLoad Testを実行しない。

専用Test Environmentを使用する。

---

# 141. Accessibility Test

可能な範囲でAccessibility Checkerを利用する。

対象：

```text
Color Contrast
ARIA
Keyboard
Form
Images
```

---

# 142. Browser Test

主要Browserで確認する。

最低限：

```text
Chrome
Edge
Safari
Firefox
```

ただし、MVPでの対応BrowserはRequirementsで明確に定義する。

---

# 143. Mobile Browser Test

必要に応じて、

```text
iOS Safari
Android Chrome
```

でも確認する。

---

# 144. Browser Compatibility

以下が主要Browserで動作することを確認する。

```text
File Upload
Drag & Drop
Image Preview
Color Picker
Processing
Download
Animation
```

---

# 145. Visual Test

UI ReferenceとのVisual差分を確認する。

対象：

```text
Home
Editor
Result
Settings
```

---

# 146. Animation Visual Test

Animationが、

```text
Start
Progress
Complete
```

の各状態で意図した動作になることを確認する。

---

# 147. Responsive Visual Test

以下のBreakpointでVisualを確認する。

```text
Mobile
Tablet
Desktop
Large Desktop
```

実際のBreakpointはFrontend設計に従う。

---

# 148. Manual Test

自動化が難しい項目はManual Testを行う。

例：

```text
Visual Quality
Color Matching Quality
Animation Feel
UX
Responsive Layout
```

---

# 149. Color Matching Manual Review

Color Matchingは数値テストだけではなく、人間によるVisual Reviewを行う。

確認項目：

- 色合いがPaletteに近づいているか
- 不自然な色変化がないか
- Skin Toneなどの自然な色が壊れていないか
- 明暗が極端に変化していないか
- 彩度が過剰になっていないか
- 元画像の雰囲気が維持されているか

---

# 150. Test Case管理

テストケースは必要に応じて以下の分類で管理する。

```text
TC-FE
Frontend

TC-BE
Backend

TC-IMG
Image Processing

TC-COLOR
Color Matching

TC-STORAGE
Storage

TC-SEC
Security

TC-E2E
End-to-End
```

---

# 151. Test Case ID

例：

```text
TC-IMG-001
```

意味：

```text
IMG
↓
Image Processing
```

---

# 152. Test Case Format

基本的なTest Caseは以下の形式とする。

```text
Test ID
Title
Precondition
Input
Steps
Expected Result
Actual Result
Status
```

---

# 153. Test Case Example

```text
Test ID:
TC-IMG-001

Title:
正常なJPEG画像を処理できる

Precondition:
対応JPEG画像を用意する

Input:
test-jpeg.jpg

Steps:
1. Upload
2. Processing
3. Result確認

Expected Result:
画像処理が成功する

Status:
Not Run
```

---

# 154. Test Status

Test Statusは以下を使用する。

```text
Not Run
Pass
Fail
Blocked
Skipped
```

---

# 155. Blocked

外部Serviceなどの問題によってTestを実行できない場合はBlockedとする。

---

# 156. Skipped

意図的に実行しないTestはSkippedとする。

理由を記録する。

---

# 157. Test Failure

TestがFailした場合、以下を確認する。

```text
Test Code
Application Log
Request ID
Environment
Input
Recent Changes
```

---

# 158. Test Failureの扱い

CIでCritical TestがFailした場合、原則としてMergeしない。

---

# 159. Critical Test

以下をCritical Testとする。

```text
Image Upload
Image Processing
Color Matching
API Validation
Storage
Security
```

---

# 160. Release Test

Release前には最低限以下を確認する。

```text
Lint
Type Check
Unit Test
Integration Test
Build
Critical E2E
Security Test
Manual UI Review
```

---

# 161. Release Checklist

## Frontend

- [ ] Build成功
- [ ] Type Check成功
- [ ] Lint成功
- [ ] Component Test成功
- [ ] E2E成功
- [ ] Responsive確認
- [ ] Accessibility確認

## Backend

- [ ] Unit Test成功
- [ ] Integration Test成功
- [ ] API Test成功
- [ ] Error Test成功
- [ ] Security Test成功

## Image Processing

- [ ] JPEG
- [ ] PNG
- [ ] WebP
- [ ] Large Image
- [ ] Corrupted Image
- [ ] Metadata
- [ ] Timeout

## Color Matching

- [ ] Palette
- [ ] Ratio
- [ ] Strength
- [ ] Color Distance
- [ ] Transformation
- [ ] Visual Quality

## Storage

- [ ] Upload
- [ ] Download
- [ ] Delete
- [ ] Not Found
- [ ] Timeout
- [ ] Cleanup

## Security

- [ ] XSS
- [ ] Path Traversal
- [ ] File Upload
- [ ] Rate Limit
- [ ] CORS
- [ ] Secret Exposure
- [ ] Error Disclosure

---

# 162. Test Automation

可能な限り以下を自動化する。

```text
Unit Test
Integration Test
API Test
Lint
Type Check
Build
Security Dependency Check
```

E2Eについても重要なUser Flowを自動化する。

---

# 163. Manual Testを残す項目

以下はManual Testを残す。

```text
Visual Quality
Color Matching Quality
Animation
UX
Design Fidelity
```

---

# 164. Test Environment Variables

Test環境ではProduction Secretを使用しない。

例：

```text
TEST_R2_ENDPOINT
TEST_R2_ACCESS_KEY
TEST_R2_SECRET
TEST_R2_BUCKET
```

など。

---

# 165. Test Data Security

Test Dataに個人情報を含めない。

実際のユーザー画像をTest Fixtureへ使用しない。

---

# 166. CI Secret

CIでSecretを使用する場合は、GitHub ActionsなどのSecret Management機能を利用する。

Source CodeへSecretを書かない。

---

# 167. CI Security

CI LogへSecretが出力されないことを確認する。

例えば、

```text
echo $R2_SECRET_ACCESS_KEY
```

などのDebug出力を行わない。

---

# 168. Test Logs

Test Logには必要な情報のみ出力する。

画像BinaryやSecretを出力しない。

---

# 169. Test Cleanup

CI終了後にTest用Storage Objectなどが残らないようCleanupする。

---

# 170. Test Isolation

Test EnvironmentとProduction Environmentを完全に分離する。

```text
Test
↓
Test R2

Production
↓
Production R2
```

---

# 171. Test Quality

良いTestは、

```text
Repeatable
Independent
Fast
Deterministic
Readable
Maintainable
```

であることを目指す。

---

# 172. Testの可読性

Test Codeは、実装者以外が読んでも、

```text
何を確認しているか
```

が分かるようにする。

---

# 173. Testの重複

同じ処理を複数のTestで過剰に重複させない。

ただし、重要なUser Flowについては適切な重複を許容する。

---

# 174. Mockの原則

Mockは必要最小限にする。

過剰にMockすると、実際のApplicationとの乖離が発生する。

---

# 175. External Service Mock

以下はUnit TestではMockする。

```text
R2
External API
Network
```

Integration Testでは可能な範囲でTest Environmentを利用する。

---

# 176. Time Mock

TimeoutやExpirationをテストする場合、TimeをMockできる設計を検討する。

---

# 177. Randomness

UUIDなどRandom値を使用する処理では、Testで検証可能な設計にする。

---

# 178. File System

Temporary Fileを利用するTestではTest終了後にCleanupする。

---

# 179. Image Fixture

Image Fixtureは必要最小限のサイズにする。

巨大画像をRepositoryへ大量にCommitしない。

---

# 180. Test Coverage Report

CIでCoverage Reportを生成できる構成を検討する。

対象：

```text
Frontend
Backend
Core Logic
```

---

# 181. Coverage Threshold

Coverage Thresholdは、実装開始後に実際のCodebaseを見ながら設定する。

初期段階では過度に高いThresholdを設定しない。

---

# 182. Coverageより重要なもの

Coverageが高くても、

```text
重要なBusiness Logic
```

がテストされていなければ品質を保証できない。

そのため、Color MatchingやImage Processingなどを優先する。

---

# 183. Test Review

Pull RequestではTest CodeもReview対象とする。

確認項目：

- [ ] Testの目的が明確
- [ ] 正常系がある
- [ ] 異常系がある
- [ ] Boundary Caseがある
- [ ] Testが独立している
- [ ] 不要なMockがない

---

# 184. New Feature Test Rule

新機能を追加する場合、原則として以下を追加する。

```text
Implementation
+
Unit Test
```

APIを追加する場合：

```text
Implementation
+
Unit Test
+
API Test
```

User Flowを追加する場合：

```text
Implementation
+
E2E Test
```

---

# 185. Bug Fix Test Rule

Bugを修正する場合、

```text
Bug Fix
+
Regression Test
```

を基本とする。

---

# 186. Refactoring Test Rule

RefactoringではBehaviorが変わっていないことを既存Testで確認する。

---

# 187. Test Before Deployment

Deployment前にCritical TestがすべてPassしていることを確認する。

---

# 188. Production Smoke Test

Deployment後に最低限のSmoke Testを行う。

例：

```text
Home
 ↓
Editor
 ↓
Upload
 ↓
Processing
 ↓
Result
```

---

# 189. Smoke Test

Production Smoke Testでは以下を確認する。

- [ ] Frontend表示
- [ ] API接続
- [ ] Upload
- [ ] Processing
- [ ] Result
- [ ] Download

---

# 190. Production Test Data

Production Smoke Testでは、実ユーザーの画像を使用しない。

専用のTest Imageを使用する。

---

# 191. Rollback

Release後に重大なTest Failureが判明した場合はRollbackを検討する。

---

# 192. Rollback Trigger

以下の場合Rollbackを検討する。

```text
Upload Failure
Processing Failure
Color Matching Failure
Storage Failure
Critical Security Issue
Frontend Crash
```

---

# 193. Test Documentation

重要なTest結果は必要に応じて、

```text
development-log.md
```

へ記録する。

---

# 194. Test Result

Test結果は、

```text
Pass
Fail
Blocked
Skipped
```

として記録する。

---

# 195. Quality Gate

Release前に以下をQuality Gateとする。

```text
Lint
    ↓ PASS
Type Check
    ↓ PASS
Unit Test
    ↓ PASS
Integration Test
    ↓ PASS
Build
    ↓ PASS
Critical E2E
    ↓ PASS
Security Test
    ↓ PASS
Manual Review
    ↓ PASS
Release
```

---

# 196. MVP Test Scope

MVPでは以下を重点的にテストする。

```text
1. Image Upload
2. Image Validation
3. Image Processing
4. Color Matching
5. API
6. Storage
7. Error Handling
8. Security
9. Main User Flow
10. Responsive UI
```

---

# 197. MVPで必須の自動テスト

最低限、以下を自動化する。

```text
Backend Unit Test
Color Matching Unit Test
Image Processing Unit Test
API Test
Validation Test
Storage Service Test
Frontend Component Test
Critical E2E Test
```

---

# 198. MVPで必須のManual Test

以下はManual Testを行う。

```text
Color Matching Visual Quality
UI Visual Quality
Animation
Responsive Design
Accessibility
```

---

# 199. 完了条件

テスト詳細設計は以下を満たすことを完了条件とする。

- [ ] Unit Test方針が定義されている
- [ ] Integration Test方針が定義されている
- [ ] API Test方針が定義されている
- [ ] E2E Test方針が定義されている
- [ ] Image Processing Testが定義されている
- [ ] Color Matching Testが定義されている
- [ ] Storage Testが定義されている
- [ ] Error Handling Testが定義されている
- [ ] Security Testが定義されている
- [ ] Frontend Component Testが定義されている
- [ ] Responsive Testが定義されている
- [ ] Accessibility Testが定義されている
- [ ] Visual Regression Testが定義されている
- [ ] Performance Test方針が定義されている
- [ ] Test Environmentが定義されている
- [ ] Test Data方針が定義されている
- [ ] Mock方針が定義されている
- [ ] CI Test方針が定義されている
- [ ] Coverage方針が定義されている
- [ ] Regression Test方針が定義されている
- [ ] Release Testが定義されている
- [ ] Smoke Testが定義されている
- [ ] Rollback方針が定義されている
- [ ] MVP Test Scopeが定義されている
- [ ] MVP必須テストが定義されている
