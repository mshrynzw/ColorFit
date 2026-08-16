# ColorFit Storage 詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおける画像Storageの詳細設計を定義する。

対象：

- Original Image
- Processed Image
- Export Image
- 一時ファイル
- Storage Key
- 保存期間
- 削除処理
- Cloudflare R2
- Storage Service
- セキュリティ
- エラー処理

ColorFitでは画像を扱うため、アプリケーション本体と画像データの保存先を分離する。

Backendの画像処理については、

`03_detail-design/03_image-processing.md`

で定義する。

Color Matchingについては、

`03_detail-design/04_color-matching.md`

で定義する。

Backend全体の構成については、

`03_detail-design/02_backend.md`

で定義する。

---

# 2. Storageの基本方針

ColorFitでは、画像データの保存先としてCloudflare R2を使用する。

基本構成：

```text
Frontend
   ↓
FastAPI
   ↓
Storage Service
   ↓
Cloudflare R2
```

Frontendから直接R2へアクセスすることを基本としない。

BackendのStorage Serviceを介して画像を保存・取得・削除する。

---

# 3. Cloudflare R2を採用する理由

ColorFitではWebデザイン用画像を扱うため、画像Storageには以下が求められる。

- 画像ファイルを保存できる
- HTTP経由で扱いやすい
- Backendからアクセスできる
- 大きな画像を扱える
- 将来的な拡張が可能
- Cloudflare環境との親和性が高い

これらを考慮し、MVPではCloudflare R2を採用する。

---

# 4. Storageの責務

Storage Layerは以下を担当する。

```text
Upload
Download
Delete
Exists Check
Object Metadata
```

Storage Layerは画像処理そのものを担当しない。

---

# 5. Storage Service

BackendではStorageへのアクセスを`StorageService`へ集約する。

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

ImageServiceからCloudflare R2 SDKを直接呼び出さない。

---

# 6. Storage Interface

Storageは抽象化して扱う。

概念：

```python
class Storage:
    def upload(...):
        ...

    def download(...):
        ...

    def delete(...):
        ...

    def exists(...):
        ...
```

実際の実装では、必要に応じて非同期処理やストリーミングを利用する。

---

# 7. R2 Adapter

Cloudflare R2固有の処理はAdapterへ分離する。

基本構成：

```text
storage/
├── base.py
├── factory.py
├── keys.py
├── local.py
└── r2.py
```

`r2.py`では以下を担当する。

- R2への接続
- Upload
- Download
- Delete
- Object Metadata
- エラー変換

DevelopmentではR2認証が無い場合に備え、`STORAGE_BACKEND=local` でローカルファイルシステムへ保存できる。

```text
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./data/storage
```

Productionでは`STORAGE_BACKEND=r2`を使用し、Frontendから直接R2へアクセスしない。

Storage KeyはBackendが生成し、ユーザー入力のファイル名はKeyに使用しない。

---

# 8. StorageとImage Processingの責務分離

以下のように責務を分離する。

```text
Image Processing
├── Image Decode
├── Color Analysis
├── Color Matching
├── Image Transformation
└── Image Encode

Storage
├── Upload
├── Download
├── Delete
└── Object Management
```

画像処理ModuleからR2 SDKを直接呼び出さない。

---

# 9. Bucket

MVPでは用途ごとにBucketを細かく分割せず、基本的にColorFit用のBucketを使用する。

概念：

```text
colorfit-images
```

実際のBucket名は環境ごとに環境変数で指定する。

---

# 10. EnvironmentごとのBucket

Development / ProductionでStorageを分離する。

例：

```text
Development
colorfit-images-dev

Production
colorfit-images-prod
```

同じBucketをDevelopmentとProductionで共有しない。

---

# 11. Storage Environment

基本的に以下の環境を想定する。

```text
Development
↓
Local PCから開発用R2へ接続

Production
↓
Cloudflare R2へ接続
```

DevelopmentでProduction Bucketへアクセスしないようにする。

---

# 12. Environment Variables

R2接続情報は環境変数で管理する。

例：

```text
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL
```

秘密情報はGit Repositoryへコミットしない。

---

# 13. R2 Access Key

R2へのアクセスには専用のAccess Keyを使用する。

権限は必要最小限とする。

Backendが必要とする操作：

```text
Read
Write
Delete
```

などに限定する。

---

# 14. Access Keyの管理

Access Keyは以下へ保存しない。

```text
Git
Source Code
README
Frontend Code
ログ
```

`.env`などのローカル環境変数、およびDeployment環境のSecretとして管理する。

---

# 15. Frontendからの直接アクセス

MVPではFrontendからR2へ直接アクセスしない。

基本：

```text
Frontend
   ↓
FastAPI
   ↓
R2
```

とする。

これによりR2のAccess Keyなどの秘密情報をFrontendへ公開しない。

---

# 16. Storage Key

R2ではユーザーがアップロードしたファイル名をそのままObject Keyとして使用しない。

以下のような一意なIDを使用する。

```text
UUID
```

---

# 17. Storage Key構成

基本的な構成：

```text
images/
  {image-id}/
    original
    processed
```

例：

```text
images/
  7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx/
    original
    processed
```

---

# 18. Original Image

ユーザーがアップロードした元画像。

概念：

```text
images/
  {image-id}/
    original
```

Original ImageはColor Matching処理の基準となる。

---

# 19. Processed Image

ColorFitによる画像処理後の画像。

概念：

```text
images/
  {image-id}/
    processed
```

Processed Imageには、Auto Color Matchingや手動調整の結果を保存する。

---

# 20. Export Image

ユーザーが最終的に書き出す画像。

MVPでは、Processed ImageをそのままExport対象として扱うこともできる。

将来的に、

```text
processed
export
```

を分離する場合はStorage Keyを追加する。

---

# 21. MVPのStorage構成

MVPでは以下を基本とする。

```text
images/
  {image-id}/
    original
    processed
```

Export時に必要な形式へ変換してダウンロードする。

不要なExportファイルを大量に保存しない。

---

# 22. ファイル拡張子

Storage Keyにユーザーが入力した拡張子をそのまま使用しない。

画像形式はObject Metadataや内部情報として管理する。

必要に応じて、

```text
original.webp
processed.webp
```

などの形式を使用する。

ただし、Storage Keyの命名規則は実装時に統一する。

---

# 23. Content-Type

R2へ画像を保存する際、適切なContent-Typeを設定する。

例：

```text
image/jpeg
image/png
image/webp
```

これにより画像を取得した際に正しいMIME Typeとして扱える。

---

# 24. Object Metadata

必要に応じて以下のMetadataを管理する。

```text
Content-Type
Content-Length
Image Format
Image ID
Created At
```

ただし、Metadataへユーザーの個人情報を保存しない。

---

# 25. Original ImageのMetadata

Original Imageについては、アプリケーション内部で必要な情報を別途管理する。

例：

```text
imageId
originalFilename
format
width
height
size
createdAt
```

MVPではDatabaseを使用しないため、すべてを永続的に管理する必要はない。

---

# 26. Processed ImageのMetadata

Processed Imageについても、必要に応じて以下を管理する。

```text
imageId
format
width
height
size
createdAt
```

Color Matchingの設定値を将来的に履歴として保存する場合はDatabase導入を検討する。

---

# 27. Original Filename

ユーザーがアップロードした元ファイル名は、Storage Keyには使用しない。

理由：

- 同名ファイルの衝突
- 特殊文字
- Path Traversal対策
- 個人情報が含まれる可能性

UI表示用に必要な場合のみ、別途扱う。

---

# 28. Path Traversal対策

Storage Keyへユーザー入力を直接使用しない。

特に、

```text
../
./
\
```

などを含むユーザー入力をObject Keyへ直接利用しない。

Storage KeyはBackend側で生成する。

---

# 29. Image ID

各画像には一意なImage IDを付与する。

基本的にはUUIDを使用する。

例：

```text
7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Image IDはStorage Key生成などに使用する。

---

# 30. Image IDとStorage Key

基本的な関係：

```text
Image ID
    ↓
Storage Key
    ↓
R2 Object
```

例：

```text
Image ID:
7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Storage:
images/
7f3d9a1c-xxxx-xxxx-xxxx-xxxxxxxxxxxx/
original
```

---

# 31. Upload Flow

画像アップロードの基本フロー：

```text
Frontend
   ↓
FastAPI
   ↓
File Validation
   ↓
Image Decode
   ↓
Image ID生成
   ↓
R2 Upload
   ↓
Image ID返却
```

---

# 32. Original Upload

Original Imageは、画像検証が成功した後にR2へ保存する。

```text
Upload
 ↓
Validation
 ↓
Decode
 ↓
Valid
 ↓
R2
```

検証前に永続Storageへ保存しない。

---

# 33. Processed Upload

Processed Imageは画像変換処理が成功した後にR2へ保存する。

```text
Original
 ↓
Image Processing
 ↓
Color Matching
 ↓
Transformation
 ↓
Output Validation
 ↓
R2
```

---

# 34. Upload失敗

R2へのUploadに失敗した場合、Frontendへ適切なエラーを返す。

例：

```text
STORAGE_UPLOAD_FAILED
```

内部ログには詳細なエラー情報を記録する。

---

# 35. Download Flow

画像取得の基本フロー：

```text
Frontend
   ↓
FastAPI
   ↓
StorageService
   ↓
R2
   ↓
Image
   ↓
Frontend
```

必要に応じて、Backendから画像データをストリーミングする。

---

# 36. Processed Image取得

PreviewなどでProcessed Imageを表示する場合、Frontendから取得できる方式を用意する。

MVPではBackend経由で取得する方式を基本とする。

将来的にPresigned URLを利用することも検討する。

---

# 37. Presigned URL

大容量画像や大量アクセスが発生する場合、Presigned URLの利用を検討する。

概念：

```text
Frontend
   ↓
FastAPI
   ↓
Presigned URL生成
   ↓
Frontend
   ↓
R2
```

これにより画像本体の転送をBackendから切り離せる。

MVPでは必須としない。

---

# 38. Delete Flow

画像削除の基本フロー：

```text
Frontend
   ↓
FastAPI
   ↓
StorageService
   ↓
R2 Delete
```

Image IDを基準に削除対象を特定する。

---

# 39. OriginalとProcessedの削除

画像を削除する場合は、関連するObjectをまとめて削除する。

```text
images/
  {image-id}/
    original
    processed
```

↓

```text
削除
```

---

# 40. Cleanup

画像処理で一時的に作成したファイルは処理完了後に削除する。

```text
Temporary
   ↓
Processing
   ↓
Output
   ↓
Cleanup
```

---

# 41. 一時ファイル

ローカルファイルシステムを使用する場合、処理完了後に削除する。

特に、

```text
/tmp
```

などへ保存した画像を永続的に残さない。

---

# 42. 保存期間

ColorFitはMVPでは画像履歴サービスを目的としない。

そのため、画像を恒久的に保存する必要はない。

基本方針：

```text
Upload
 ↓
Processing
 ↓
Result
 ↓
User Download
 ↓
一定期間後に削除
```

具体的な保存期間は、実際のUXと運用コストを確認して決定する。

---

# 43. MVPの保存期間方針

MVPでは、処理結果をユーザーが確認・ダウンロードできる程度の期間だけ保存する。

不要になった画像は自動的に削除する。

具体的な日数は、MVPの実装・テスト時に決定する。

Phase 4では、画像メタデータの `createdAt` から `IMAGE_TTL_HOURS`（既定 24時間）を超えた画像を、取得時に削除して `IMAGE_NOT_FOUND` とする。

`IMAGE_TTL_HOURS` が 0 以下の場合は期限切れ削除を行わない。

---

# 44. Lifecycle Rule

R2のLifecycle機能を利用して、古い画像を自動削除する方式を検討する。

概念：

```text
Upload
 ↓
Storage
 ↓
Expiration
 ↓
Automatic Delete
```

これにより不要画像がStorageに蓄積することを防ぐ。

---

# 45. Cleanup Job

Lifecycle Ruleだけでは対応しにくいデータがある場合、Backend側のCleanup Jobを利用する。

将来的には、

```text
Scheduled Job
 ↓
Expired Images
 ↓
Delete
```

という仕組みを検討する。

MVPではR2 Lifecycleを優先する。

---

# 46. 未完了処理

以下のようなケースを考慮する。

```text
Upload成功
 ↓
Processing失敗
```

この場合、Original Imageだけが残る可能性がある。

不要なOriginalが残らないよう、失敗時のCleanupを行う。

---

# 47. Orphan Object

以下のようなStorage上の孤立ObjectをOrphan Objectとする。

```text
R2
 ↓
存在するObject
 ↓
アプリケーションから参照されない
```

MVPではDatabaseを使用しないため、Orphan Objectが発生しない設計を優先する。

---

# 48. Upload処理の原則

Uploadでは以下の順序を基本とする。

```text
1. Request受信
2. ファイルサイズ確認
3. MIME Type確認
4. 画像Decode
5. 画像形式確認
6. 解像度確認
7. EXIF処理
8. Image ID生成
9. R2 Upload
```

---

# 49. Process処理の原則

画像処理では、

```text
1. Original取得
2. Decode
3. Analysis
4. Color Matching
5. Transformation
6. Output Validation
7. Encode
8. R2 Upload
```

を基本とする。

---

# 50. Output生成

Processed ImageをR2へ保存する前に、出力画像を検証する。

確認：

```text
ファイル生成
画像形式
幅
高さ
Alpha
ファイルサイズ
```

---

# 51. Storage Error

Storage Errorを分類する。

例：

```text
STORAGE_CONNECTION_FAILED
STORAGE_UPLOAD_FAILED
STORAGE_DOWNLOAD_FAILED
STORAGE_DELETE_FAILED
STORAGE_NOT_FOUND
```

Frontendにはユーザーが理解できるメッセージを返す。

---

# 52. Retry

一時的なStorageエラーについては、限定的なRetryを検討する。

例：

```text
Upload
 ↓
Temporary Error
 ↓
Retry
 ↓
Success
```

ただし、無限Retryは禁止する。

---

# 53. Retry回数

Retryは少数回に限定する。

例：

```text
最大3回
```

など。

具体的な値は実装時に決定する。

---

# 54. Retry対象

Retry対象として検討する：

```text
Network Timeout
Temporary Connection Error
Temporary R2 Error
```

Retryしても成功しないと考えられる入力エラーなどはRetryしない。

---

# 55. Storage Timeout

R2との通信にはTimeoutを設定する。

対象：

```text
Upload
Download
Delete
```

長時間応答がない場合は処理を終了する。

---

# 56. Content-Length

Upload前に可能な限りファイルサイズを確認する。

ただし、HTTP Headerの値だけを信用せず、実際のデータサイズも考慮する。

---

# 57. 大容量ファイル

大容量ファイルを処理する場合、Backendのメモリ使用量を考慮する。

可能な限り、

```text
Memory
↓
Stream
↓
Processing
```

を検討する。

ただし、Pillow / NumPyによる画像処理では画像全体をメモリへ展開する必要がある場合がある。

そのため、最大解像度を適切に制限する。

---

# 58. Storageとメモリ

Storageから取得した画像を必要以上にメモリへ保持しない。

基本：

```text
R2
 ↓
Read
 ↓
Image Processing
 ↓
Release
```

不要な複製を避ける。

---

# 59. Cache

MVPでは、画像そのものをBackendメモリへ長期間Cacheしない。

同じ画像に対する解析結果Cacheが必要になった場合は、

```text
Analysis Cache
```

として別途設計する。

---

# 60. Image Hash

将来的に重複画像検出やCacheを導入する場合、画像Hashを利用できる。

概念：

```text
Image
 ↓
Hash
 ↓
Image Identity
```

ただし、MVPでは必須としない。

---

# 61. Storage URL

R2の内部EndpointをFrontendへ直接公開しない。

FrontendへURLを返す必要がある場合は、以下のいずれかを利用する。

```text
Backend API URL
```

または

```text
Presigned URL
```

---

# 62. Public Bucket

画像Bucketを無条件にPublicにすることは避ける。

ユーザーがアップロードした画像には、個人情報や機密情報が含まれる可能性があるためである。

基本的にPrivate Bucketを使用する。

---

# 63. Private Bucket

MVPではR2 BucketをPrivateとして運用する。

画像アクセスは、

```text
Frontend
 ↓
Backend
 ↓
R2
```

を基本とする。

---

# 64. 将来的なPublic CDN

将来的に公開画像や共有機能を実装する場合は、Cloudflare CDNなどを利用したPublic URLを検討する。

ただし、ユーザーがアップロードした画像を無条件に公開しない。

---

# 65. セキュリティ

Storageでは以下を実施する。

- BucketをPrivateにする
- Access KeyをFrontendへ公開しない
- Access KeyをGitへ保存しない
- Object Keyをユーザー入力から生成しない
- ファイル形式を検証する
- ファイルサイズを制限する
- 不要な画像を削除する
- Presigned URLの有効期限を設定する

---

# 66. Presigned URLの有効期限

将来的にPresigned URLを導入する場合、有効期限を短く設定する。

目的：

```text
URL漏洩
 ↓
不正アクセス
```

のリスクを低減する。

具体的な有効期限は導入時に決定する。

---

# 67. ユーザー間の分離

将来的に認証機能を追加した場合、ユーザーごとにStorage Keyを分離する。

例：

```text
users/
  {user-id}/
    images/
      {image-id}/
        original
        processed
```

---

# 68. MVPとUser ID

MVPではユーザー認証を実装しない。

そのため、

```text
users/{user-id}
```

のような構造は必須としない。

MVPではImage IDを中心に管理する。

---

# 69. 将来のProject単位管理

将来的にWebデザインプロジェクトを保存できるようにする場合、

```text
projects/
  {project-id}/
    images/
      {image-id}/
```

という構造を検討する。

---

# 70. Databaseとの関係

MVPではDatabaseを必須としない。

ただし将来的に、

- ユーザー
- プロジェクト
- 画像履歴
- Palette
- 調整履歴

を保存する場合はDatabaseを導入する。

---

# 71. Database導入後

Databaseを導入した場合でも、画像BinaryそのものはR2へ保存する。

基本構成：

```text
Database
├── Image ID
├── User ID
├── Project ID
├── Storage Key
├── Metadata
└── Created At

R2
└── Image Binary
```

Databaseに画像Binaryを保存しない。

---

# 72. Image Record

将来的なDatabaseでは、例えば以下を管理する。

```text
Image
├── id
├── userId
├── projectId
├── originalKey
├── processedKey
├── format
├── width
├── height
├── size
└── createdAt
```

詳細なDatabase設計は `05_database.md` で定義する。

---

# 73. StorageとDatabaseの整合性

Database導入後は、

```text
Database Record
```

と

```text
R2 Object
```

の整合性を維持する必要がある。

例えば、

```text
DBには存在する
↓
R2に存在しない
```

という状態を検知できるようにする。

---

# 74. Upload Transaction

Database導入後のUploadでは、

```text
R2 Upload
 ↓
DB Record Create
```

などの順序を検討する。

どちらかが失敗した場合、不要なObjectをCleanupする。

---

# 75. Delete Transaction

削除時は、

```text
R2 Delete
 ↓
DB Record Delete
```

などの順序を検討する。

DatabaseとStorageの片方だけが削除される状態をできるだけ避ける。

---

# 76. Storage Lifecycle

Storageのライフサイクルを以下のように考える。

```text
NEW
 ↓
UPLOADED
 ↓
PROCESSING
 ↓
PROCESSED
 ↓
EXPIRED
 ↓
DELETED
```

MVPでは内部状態をDatabaseへ保存する必要はない。

---

# 77. Processing中の画像

Processing中は、

```text
Original
```

を保持する。

Processingが成功したら、

```text
Processed
```

を生成する。

---

# 78. Processing失敗時

Processingが失敗した場合、

```text
Original
```

を必要に応じて削除する。

ユーザーが再処理する可能性がある場合は一定期間保持してもよい。

具体的なUXとの兼ね合いで決定する。

---

# 79. Export後

ユーザーが画像をDownloadした後、不要になったProcessed Imageは自動削除対象とする。

ただし、

```text
ユーザーがページへ戻る
```

などのUXを考慮し、即時削除ではなく一定期間保持する方式を基本とする。

---

# 80. 自動削除

不要なObjectについてはR2 Lifecycle Ruleなどを利用して自動削除する。

基本：

```text
Old Object
 ↓
Lifecycle Rule
 ↓
Delete
```

---

# 81. 手動Cleanup

運用上必要になった場合、管理者が不要なObjectを削除できる仕組みを検討する。

MVPでは管理画面を作成しない。

---

# 82. Storage容量

Storage容量は定期的に確認する。

監視対象：

```text
Object Count
Storage Size
Upload Rate
Delete Rate
```

---

# 83. コスト管理

ColorFitは画像を扱うため、Storage容量と転送量を考慮する。

不要な画像を長期間保存しないことで、

```text
Storage Cost
Bandwidth Cost
```

を抑える。

---

# 84. Development環境

Developmentでは、できるだけ本番Storageを使用しない。

```text
Local Development
 ↓
Development R2
```

とする。

---

# 85. Production環境

Productionでは、

```text
Production Backend
 ↓
Production R2
```

へ接続する。

DevelopmentとProductionのAccess Keyを分離する。

---

# 86. テスト環境

テストでR2へアクセスする場合は、可能な限り専用Bucketを使用する。

例：

```text
colorfit-images-test
```

テスト終了後に不要Objectを削除する。

---

# 87. Unit Test

Storage ServiceのUnit Testでは、R2へ実際にアクセスせずMockを利用できる。

テスト対象：

```text
upload()
download()
delete()
exists()
```

---

# 88. Integration Test

Integration Testでは、実際のR2またはテスト用Storageを使用して以下を確認する。

```text
Upload
↓
Exists
↓
Download
↓
Delete
↓
Not Found
```

---

# 89. Storage Test

最低限以下をテストする。

### Upload

```text
画像が正常に保存される
```

### Download

```text
保存した画像を取得できる
```

### Delete

```text
画像を削除できる
```

### Not Found

```text
存在しないObjectを取得した場合に適切なエラーになる
```

---

# 90. Security Test

以下を確認する。

- FrontendからSecretが取得できない
- Private Bucketへ無許可アクセスできない
- 不正なStorage Keyを指定できない
- 他のImage IDへ不正アクセスできない
- Presigned URLが適切に期限切れになる

---

# 91. Orphan Object Test

以下のケースを確認する。

```text
R2 Upload成功
↓
DB処理失敗
```

などの異常系で不要なObjectが残らないことを確認する。

Database導入前は、アプリケーション内部で適切にCleanupできることを確認する。

---

# 92. Storage Service API

概念的なInterface：

```python
class StorageService:

    async def upload(
        self,
        key: str,
        data,
        content_type: str,
    ):
        ...

    async def download(
        self,
        key: str,
    ):
        ...

    async def delete(
        self,
        key: str,
    ):
        ...

    async def exists(
        self,
        key: str,
    ):
        ...
```

実際の実装はR2 SDKの仕様に合わせる。

---

# 93. Storage Key生成

Storage Keyは専用関数で生成する。

概念：

```python
def create_image_key(image_id: str, kind: str) -> str:
    return f"images/{image_id}/{kind}"
```

例えば、

```text
images/{image-id}/original
images/{image-id}/processed
```

を生成する。

---

# 94. Storage KeyのValidation

Storage Keyをユーザー入力から直接生成しない。

Backend内部で、

```text
Image ID
+
固定Path
+
固定Object Type
```

から生成する。

---

# 95. Object Type

基本的に以下を使用する。

```text
original
processed
```

将来的に必要になった場合、

```text
preview
export
thumbnail
```

などを追加する。

---

# 96. Preview Image

将来的に高速PreviewをR2へ保存する場合：

```text
images/
  {image-id}/
    original
    preview
    processed
```

とする。

MVPではFrontend側でPreviewを生成できる場合、必須ではない。

---

# 97. Thumbnail

画像一覧などの機能を追加する場合、Thumbnailを生成する。

```text
images/
  {image-id}/
    original
    thumbnail
    processed
```

MVPでは実装しない。

---

# 98. Export Format

ユーザーが指定した出力形式に応じてExport処理を行う。

```text
WebP
JPEG
PNG
```

Export結果を恒久保存する必要がなければ、Processed Imageから動的に生成する。

---

# 99. Download

Download処理では、

```text
Processed Image
 ↓
Export Format
 ↓
Response / Presigned URL
```

という流れを基本とする。

---

# 100. Download時のファイル名

ユーザーがDownloadするファイル名はStorage Keyとは分離する。

例えば、

```text
test.png → test.webp
CHASE!.png → CHASE!.webp
```

のように、元ファイル名の拡張子だけを `.webp` へ置き換えたユーザー向けファイル名を生成する。

元ファイル名を利用する場合も、安全な文字列へ正規化する。
使えない場合は `image.webp` とする。

---

# 101. Content-Disposition

Download時には適切なContent-Dispositionを設定する。

基本的には、

```text
attachment
```

としてユーザーが保存できるようにする。

Preview用途では、

```text
inline
```

を利用することもできる。

---

# 102. 画像の公開範囲

ColorFitでユーザーがアップロードした画像は、原則としてPrivate Dataとして扱う。

ユーザーが明示的に公開・共有する機能を追加する場合のみ、Public URLなどを検討する。

---

# 103. 個人情報

画像には以下のような情報が含まれる可能性がある。

- 人物
- 住所
- 書類
- GPS Metadata
- その他の個人情報

そのため、画像を不要に長期間保存しない。

---

# 104. EXIF Metadata

Original Imageについても、可能な限り不要なEXIF情報をそのまま公開しない。

Processed / Export Imageでは、特にGPSなどの個人情報を削除する。

詳細は、

`03_detail-design/03_image-processing.md`

を参照する。

---

# 105. ログ

Storage操作についてログを残す場合：

```text
requestId
imageId
operation
storageKey
result
processingTime
errorCode
```

などを記録できる。

Access KeyなどのSecretは絶対にログへ出力しない。

---

# 106. Storage Keyのログ

Storage Keyは必要に応じてログへ記録できる。

ただし、ユーザーの個人情報を含むPathを使用しないことを前提とする。

---

# 107. Monitoring

将来的に以下を監視する。

```text
Upload Failure Rate
Download Failure Rate
Delete Failure Rate
Storage Size
Object Count
Processing Time
```

---

# 108. 障害時の挙動

R2が一時的に利用できない場合、

```text
Frontend
 ↓
FastAPI
 ↓
Storage Error
```

として、ユーザーへ適切なエラーを返す。

内部ではError Logを記録する。

---

# 109. R2障害時のRetry

一時的な通信障害については限定的にRetryする。

ただし、

```text
無限Retry
```

は禁止する。

一定回数失敗した場合はエラーとして処理を終了する。

---

# 110. StorageとAPIの責務

API Routerは、

```text
Request
Response
HTTP Status
```

を担当する。

StorageServiceは、

```text
Upload
Download
Delete
```

を担当する。

R2 Adapterは、

```text
Cloudflare R2 SDK
```

との通信を担当する。

---

# 111. 依存関係

基本的な依存方向：

```text
API Router
    ↓
Image Service
    ↓
Storage Service
    ↓
R2 Adapter
    ↓
Cloudflare R2
```

RouterからR2 SDKを直接呼び出さない。

---

# 112. Storage Layerのディレクトリ

Backendでは以下を基本とする。

```text
app/
└── storage/
    ├── interface.py
    └── r2.py
```

必要に応じて、

```text
storage/
├── interface.py
├── r2.py
└── mock.py
```

などを追加する。

---

# 113. Mock Storage

テスト用としてMock Storageを用意できる。

```text
Storage Interface
       ↓
 ┌─────┴─────┐
 ↓           ↓
R2          Mock
```

これにより、R2へ接続せずStorage Serviceのテストが可能になる。

---

# 114. 開発時のStorage

ローカル開発では、以下の方式を検討できる。

```text
Option A
Local Filesystem

Option B
Development R2
```

本番環境との差異を減らすため、基本的にはDevelopment R2を利用する。

ただし、Storage ServiceのUnit TestではMockを利用する。

---

# 115. Local Filesystem

Local Filesystemを利用する場合は、

```text
backend/
└── .tmp/
```

などの一時ディレクトリを使用する。

このディレクトリはGit管理対象外とする。

---

# 116. Git管理

以下をGitへコミットしない。

```text
.env
.env.local
R2 Secret
Access Key
アップロード画像
一時画像
生成画像
```

`.gitignore`へ必要なパターンを追加する。

---

# 117. Backup

MVPではユーザー画像の長期保存を目的としないため、ユーザー画像のBackup機能は実装しない。

将来的に画像履歴サービスへ発展する場合は、Backup / Disaster Recoveryを検討する。

---

# 118. Disaster Recovery

将来的に重要なユーザーデータを永続保存する場合は、

- R2の冗長性
- Backup
- 復旧手順
- データ保持期間

などを別途設計する。

MVPでは対象外とする。

---

# 119. Storage容量制御

画像が無制限に保存されないよう、保存期間を設ける。

将来的には、

```text
User
 ↓
Storage Quota
 ↓
Maximum Storage
```

の導入を検討する。

MVPでは不要。

---

# 120. 同時処理

同一画像に対する複数のProcessed Image生成が発生する可能性を考慮する。

例えば、

```text
User
 ↓
Slider操作
 ↓
Transform A

User
 ↓
Slider操作
 ↓
Transform B
```

のようなケース。

不要なProcessed Objectが大量に生成されないよう、必要に応じて上書き方式や一時Object方式を検討する。

---

# 121. Processed Imageの扱い

MVPでは最新のProcessed Imageのみを保存する方式を基本とする。

```text
original
processed
```

ユーザーが調整するたびに、

```text
processed
```

を更新する。

---

# 122. Versioning

画像履歴機能を将来追加する場合は、

```text
processed/
  {version}
```

などのVersion管理を検討する。

MVPではVersioningを実装しない。

---

# 123. 画像履歴

MVPでは画像編集履歴を永続保存しない。

将来的に、

```text
Original
 ↓
Adjustment 1
 ↓
Adjustment 2
 ↓
Adjustment 3
```

のような履歴機能を実装する場合はDatabaseを導入する。

---

# 124. Storageの基本データモデル

MVP：

```text
Image
├── imageId
├── original
└── processed
```

将来：

```text
User
└── Project
    └── Image
        ├── Original
        ├── Preview
        ├── Processed
        └── Export
```

---

# 125. MVP Storage Architecture

最終的なMVP構成：

```text
                 ┌───────────────┐
                 │   Frontend    │
                 └───────┬───────┘
                         │
                         ↓
                 ┌───────────────┐
                 │    FastAPI    │
                 └───────┬───────┘
                         │
                         ↓
                 ┌───────────────┐
                 │ Image Service │
                 └───────┬───────┘
                         │
                         ↓
                 ┌───────────────┐
                 │Storage Service│
                 └───────┬───────┘
                         │
                         ↓
                 ┌───────────────┐
                 │ Cloudflare R2 │
                 └───────────────┘
```

---

# 126. Storage Object構成

MVP：

```text
colorfit-images-prod/
└── images/
    └── {image-id}/
        ├── original
        └── processed
```

Development：

```text
colorfit-images-dev/
└── images/
    └── {image-id}/
        ├── original
        └── processed
```

---

# 127. Storage処理フロー

## Upload

```text
File
 ↓
Validation
 ↓
Image ID
 ↓
Storage Key
 ↓
R2 Upload
```

## Process

```text
Original
 ↓
Image Processing
 ↓
Color Matching
 ↓
Processed
 ↓
R2 Upload
```

## Download

```text
Image ID
 ↓
Storage Key
 ↓
R2
 ↓
Response
```

## Delete

```text
Image ID
 ↓
Original Key
Processed Key
 ↓
R2 Delete
```

---

# 128. Storage設計の原則

Storage実装では以下を原則とする。

1. Cloudflare R2をMVPの画像Storageとして使用する。
2. BackendからStorageへアクセスする。
3. FrontendへR2 Secretを公開しない。
4. Bucketは原則Privateとする。
5. DevelopmentとProductionのStorageを分離する。
6. ユーザー入力をStorage Keyへ直接使用しない。
7. Image IDを利用して一意なKeyを生成する。
8. OriginalとProcessedを分離する。
9. 不要な画像を長期間保存しない。
10. Lifecycle Ruleによる自動削除を検討する。
11. StorageアクセスをStorage Serviceへ集約する。
12. R2固有処理をAdapterへ分離する。
13. Storageエラーを適切に分類する。
14. 一時的な通信エラーには限定的なRetryを行う。
15. Storage操作にTimeoutを設定する。
16. 画像の個人情報を考慮する。
17. 不要なEXIF Metadataを公開しない。
18. Storage Secretをログへ出力しない。
19. Database導入後も画像BinaryはR2へ保存する。
20. 将来的なPresigned URL利用を考慮する。

---

# 129. 完了条件

Storage詳細設計は以下を満たすことを完了条件とする。

- [ ] Cloudflare R2の採用が定義されている
- [ ] Storage Layerの責務が定義されている
- [ ] Storage Serviceが定義されている
- [ ] R2 Adapterが定義されている
- [ ] Bucket構成が定義されている
- [ ] Development / Productionの分離方針が定義されている
- [ ] Environment Variablesが定義されている
- [ ] Storage Keyの構成が定義されている
- [ ] Original Imageの扱いが定義されている
- [ ] Processed Imageの扱いが定義されている
- [ ] Export Imageの扱いが定義されている
- [ ] Upload処理が定義されている
- [ ] Download処理が定義されている
- [ ] Delete処理が定義されている
- [ ] Cleanup方針が定義されている
- [ ] 保存期間の方針が定義されている
- [ ] Lifecycle Ruleの方針が定義されている
- [ ] Orphan Objectへの対策が定義されている
- [ ] Storage Errorの方針が定義されている
- [ ] Retry方針が定義されている
- [ ] Timeout方針が定義されている
- [ ] Security方針が定義されている
- [ ] Test方針が定義されている
- [ ] Database導入後のStorageとの関係が定義されている
- [ ] 将来的なPresigned URLへの拡張方針が定義されている
