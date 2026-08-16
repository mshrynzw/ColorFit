# ColorFit データベース設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるDatabaseの利用方針、データモデル、将来的なSchemaおよびStorageとの責務分担を定義する。

ColorFitでは、画像データそのものをDatabaseへ保存せず、画像はCloudflare R2などのObject Storageへ保存する。

Databaseには、必要に応じて画像やColor Matching処理に関するMetadataを保存する。

---

# 2. Database基本方針

ColorFitでは以下を基本方針とする。

1. MVPではDatabaseを必須Componentとしない。
2. 画像BinaryをDatabaseへ保存しない。
3. 画像はObject Storageへ保存する。
4. DatabaseにはMetadataを保存する。
5. BackendからDatabaseへアクセスする。
6. FrontendからDatabaseへ直接アクセスしない。
7. DatabaseへのアクセスをService Layerへ集約する。
8. 将来的なAuthentication追加を考慮する。
9. 将来的なProject保存機能を考慮する。
10. 不要なDatabase SchemaをMVPで先行して作成しない。
11. Database導入時も最小限のSchemaから開始する。
12. 個人情報やユーザーデータを必要以上に保存しない。

---

# 3. MVPにおけるDatabase

## 3.1 Databaseを使用しない理由

MVPのColorFitでは、ユーザーが画像をUploadしてColor Matchingを実行し、Resultを取得するまでの処理が基本となる。

```text
Image Upload
    ↓
Color Settings
    ↓
Processing
    ↓
Result
    ↓
Download
```

このUser Flowでは、永続的なユーザーデータを必要としない。

そのためMVPでは、

```text
Frontend
    ↓
FastAPI
    ↓
Image Processing
    ↓
Cloudflare R2
```

を基本構成とする。

---

# 4. MVP Architecture

MVPではDatabaseをArchitectureから除外する。

```text
┌───────────────────────┐
│       Frontend        │
│                       │
│ React                 │
│ React Router          │
│ TypeScript            │
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
│ Image Processing      │
│ Color Matching        │
│ Storage Service       │
└───────────┬───────────┘
            │
            ↓
┌───────────────────────┐
│   Cloudflare R2       │
│                       │
│ Original Image        │
│ Processed Image       │
└───────────────────────┘
```

---

# 5. Database導入タイミング

以下のような機能を追加する場合、Database導入を検討する。

```text
User Authentication
Project Management
Image History
Saved Palette
Favorite
User Settings
Processing History
Usage Statistics
```

---

# 6. 将来Architecture

Database導入後は以下の構成を基本とする。

```text
                         Frontend
                            │
                            │ HTTPS
                            ↓
                         FastAPI
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
          Database      Image Service   Storage
             │              │              │
             ↓              ↓              ↓
        PostgreSQL        Metadata          R2
                                          Images
```

---

# 7. Databaseの役割

Databaseは以下の情報を管理する。

```text
User
Project
Image Metadata
Palette
Processing Job
Processing Result
User Settings
```

ただし、実際に必要なEntityのみ導入する。

---

# 8. DatabaseとR2の責務分担

DatabaseとR2の責務を明確に分離する。

## Database

```text
Metadata
User
Project
Palette
Processing Information
```

## R2

```text
Original Image
Processed Image
Thumbnail
```

---

# 9. Image BinaryをDatabaseへ保存しない

以下のような設計は採用しない。

```text
Database
└── Image Binary
```

画像データはR2へ保存する。

```text
Database
└── image metadata
        │
        │ object key
        ↓
R2
└── image binary
```

---

# 10. Image Metadata

Databaseへ保存する可能性のあるImage Metadata：

```text
image_id
project_id
original_object_key
processed_object_key
original_filename
mime_type
file_size
width
height
created_at
updated_at
expires_at
```

---

# 11. Image ID

Imageには一意なIDを付与する。

例：

```text
UUID
```

Image IDはDatabaseとR2 Object Keyの関連付けに使用する。

---

# 12. R2 Object Key

R2 Object KeyにはDatabase上のImage IDなどを利用できる。

例：

```text
images/{image_id}/original
images/{image_id}/processed
```

実際のObject Keyは、

`03_detail-design/05_storage.md`

の設計に従う。

---

# 13. User Entity

Authenticationを導入する場合、User Entityを追加する。

概念：

```text
User
├── id
├── email
├── created_at
└── updated_at
```

認証方式によって必要な項目は変更する。

---

# 14. User ID

User IDは一意なIdentifierとする。

例：

```text
UUID
```

User IDを各ResourceのOwner情報として使用する。

---

# 15. Email

EmailをDatabaseへ保存する場合、Authentication設計と整合させる。

MVPではAuthenticationを実装しないため、User Tableは作成しない。

---

# 16. Project Entity

将来的にユーザーがWebデザインごとの設定を保存できるようにする場合、Project Entityを追加する。

概念：

```text
Project
├── id
├── user_id
├── name
├── description
├── created_at
└── updated_at
```

---

# 17. Projectの役割

Projectは、

```text
Web Design
```

単位の情報を管理する。

例えば、

```text
Corporate Website
Cafe Website
Portfolio Website
Landing Page
```

など。

---

# 18. ProjectとImage

1つのProjectに複数のImageを関連付けられる設計を想定する。

```text
Project
    │
    ├── Image
    ├── Image
    └── Image
```

Relationship：

```text
Project 1
    ↓
Image N
```

---

# 19. Palette Entity

ユーザーがColor Paletteを保存できるようにする場合、Palette Entityを追加する。

概念：

```text
Palette
├── id
├── project_id
├── name
├── created_at
└── updated_at
```

---

# 20. Palette Color Entity

Paletteに複数のColorを関連付ける。

概念：

```text
Palette
    │
    ├── PaletteColor
    ├── PaletteColor
    └── PaletteColor
```

---

# 21. PaletteColor

PaletteColorでは以下を管理する。

```text
id
palette_id
color
ratio
position
```

例：

```text
Primary
#1A2B3C
60%

Secondary
#4D5E6F
30%

Accent
#FFAA00
10%
```

---

# 22. Color Format

Colorは基本的にHEX形式を使用する。

例：

```text
#FFFFFF
#000000
#12ABEF
```

Databaseへ保存する場合もValidationを行う。

---

# 23. Ratio

Palette ColorのRatioを保存する。

例：

```text
Primary: 60
Secondary: 30
Accent: 10
```

合計値が100になることをApplication LayerでValidationする。

---

# 24. RatioのDatabase Validation

DatabaseだけにBusiness Ruleを依存しない。

以下のValidationはBackendで行う。

```text
0 <= ratio <= 100
```

さらにPalette全体について、

```text
SUM(ratio) = 100
```

を確認する。

---

# 25. Processing Job Entity

将来的に非同期画像処理を導入する場合、Processing Job Entityを追加する。

概念：

```text
ProcessingJob
├── id
├── image_id
├── status
├── progress
├── error_code
├── created_at
├── started_at
└── completed_at
```

---

# 26. Processing Job Status

基本的なStatus：

```text
queued
processing
completed
failed
cancelled
```

---

# 27. Processing Job Flow

将来的な非同期処理：

```text
User
 ↓
Create Processing Job
 ↓
queued
 ↓
processing
 ↓
Color Matching
 ↓
completed
 ↓
Result
```

Error：

```text
processing
 ↓
failed
```

---

# 28. Processing Result Entity

必要に応じてProcessing Resultを保存する。

概念：

```text
ProcessingResult
├── id
├── job_id
├── processed_image_id
├── created_at
└── metadata
```

ただし、MVPではProcessing ResultをDatabaseへ保存する必要はない。

---

# 29. Processing Settings

Color Matchingに使用した設定を保存する場合、以下の情報を管理する。

```text
strength
palette
ratio
algorithm_version
```

---

# 30. Algorithm Version

Color Matching Algorithmを将来変更する可能性があるため、必要に応じてAlgorithm Versionを保存する。

例：

```text
v1
v2
```

これにより、過去のResultがどのAlgorithmで生成されたかを追跡できる。

---

# 31. Processing Metadata

必要に応じて以下を保存する。

```text
processing_time
input_width
input_height
output_width
output_height
input_format
output_format
algorithm_version
```

---

# 32. Processing Time

Processing TimeはPerformance MonitoringやAnalyticsに利用できる。

ただし、MVPではDatabaseへの保存を必須としない。

---

# 33. User Settings Entity

将来的にUserごとの設定を保存する場合、UserSettings Entityを追加する。

例：

```text
UserSettings
├── user_id
├── theme
├── language
├── default_strength
├── created_at
└── updated_at
```

---

# 34. Settingsの考え方

Settingsは、

```text
Application Settings
```

と、

```text
User Settings
```

を分離する。

---

# 35. Application Settings

Application全体に適用される設定。

例：

```text
Maximum File Size
Supported Image Formats
Processing Limits
```

これらはDatabaseではなくEnvironment Configurationで管理する。

---

# 36. User Settings

ユーザーごとに異なる設定。

例：

```text
Theme
Default Strength
Preferred Language
```

など。

User Settingsを保存する場合はDatabaseを使用する。

---

# 37. Database Schema

将来的な基本Schema：

```text
users
    │
    ├───────────────┐
    ↓               ↓
projects        user_settings
    │
    ├───────────────┐
    ↓               ↓
images          palettes
                    │
                    ↓
              palette_colors

images
    │
    ↓
processing_jobs
    │
    ↓
processing_results
```

---

# 38. ER Diagram

将来的なER Diagram：

```text
┌─────────────┐
│    users    │
├─────────────┤
│ id PK       │
│ email       │
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │
       │ 1:N
       ↓
┌─────────────┐
│  projects   │
├─────────────┤
│ id PK       │
│ user_id FK  │
│ name        │
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       │ 1:N              │ 1:N
       ↓                  ↓
┌─────────────┐      ┌─────────────┐
│   images    │      │  palettes   │
├─────────────┤      ├─────────────┤
│ id PK       │      │ id PK       │
│ project_id  │      │ project_id  │
│ object_key  │      │ name        │
│ filename    │      │ created_at  │
│ mime_type   │      └──────┬──────┘
│ file_size   │             │
│ width       │             │ 1:N
│ height      │             ↓
│ created_at  │      ┌──────────────┐
└──────┬──────┘      │palette_colors│
       │              ├──────────────┤
       │ 1:N          │ id PK        │
       ↓              │ palette_id   │
┌────────────────┐    │ color        │
│processing_jobs │    │ ratio        │
├────────────────┤    │ position     │
│ id PK          │    └──────────────┘
│ image_id FK    │
│ status         │
│ progress       │
│ error_code     │
│ created_at     │
└──────┬─────────┘
       │
       │ 1:1
       ↓
┌────────────────────┐
│processing_results  │
├────────────────────┤
│ id PK              │
│ job_id FK          │
│ processed_image_id │
│ created_at         │
└────────────────────┘
```

---

# 39. users Table

将来的なSchema：

| Column     | Type      | Nullable | Description |
| ---------- | --------- | -------: | ----------- |
| id         | UUID      |       No | User ID     |
| email      | VARCHAR   |       No | Email       |
| created_at | TIMESTAMP |       No | 作成日時    |
| updated_at | TIMESTAMP |       No | 更新日時    |

---

# 40. projects Table

将来的なSchema：

| Column      | Type      | Nullable | Description  |
| ----------- | --------- | -------: | ------------ |
| id          | UUID      |       No | Project ID   |
| user_id     | UUID      |       No | User ID      |
| name        | VARCHAR   |       No | Project Name |
| description | TEXT      |      Yes | Description  |
| created_at  | TIMESTAMP |       No | 作成日時     |
| updated_at  | TIMESTAMP |       No | 更新日時     |

---

# 41. images Table

将来的なSchema：

| Column               | Type      | Nullable | Description                |
| -------------------- | --------- | -------: | -------------------------- |
| id                   | UUID      |       No | Image ID                   |
| project_id           | UUID      |      Yes | Project ID                 |
| original_object_key  | VARCHAR   |       No | Original Image Object Key  |
| processed_object_key | VARCHAR   |      Yes | Processed Image Object Key |
| original_filename    | VARCHAR   |      Yes | Original Filename          |
| mime_type            | VARCHAR   |       No | MIME Type                  |
| file_size            | BIGINT    |       No | File Size                  |
| width                | INTEGER   |       No | Image Width                |
| height               | INTEGER   |       No | Image Height               |
| created_at           | TIMESTAMP |       No | 作成日時                   |
| updated_at           | TIMESTAMP |       No | 更新日時                   |
| expires_at           | TIMESTAMP |      Yes | Expiration                 |

---

# 42. palettes Table

将来的なSchema：

| Column     | Type      | Nullable | Description  |
| ---------- | --------- | -------: | ------------ |
| id         | UUID      |       No | Palette ID   |
| project_id | UUID      |       No | Project ID   |
| name       | VARCHAR   |       No | Palette Name |
| created_at | TIMESTAMP |       No | 作成日時     |
| updated_at | TIMESTAMP |       No | 更新日時     |

---

# 43. palette_colors Table

将来的なSchema：

| Column     | Type    | Nullable | Description      |
| ---------- | ------- | -------: | ---------------- |
| id         | UUID    |       No | Palette Color ID |
| palette_id | UUID    |       No | Palette ID       |
| color      | CHAR(7) |       No | HEX Color        |
| ratio      | DECIMAL |       No | Color Ratio      |
| position   | INTEGER |       No | 表示順           |

---

# 44. processing_jobs Table

将来的なSchema：

| Column       | Type      | Nullable | Description       |
| ------------ | --------- | -------: | ----------------- |
| id           | UUID      |       No | Job ID            |
| image_id     | UUID      |       No | Image ID          |
| status       | VARCHAR   |       No | Processing Status |
| progress     | INTEGER   |      Yes | Progress          |
| error_code   | VARCHAR   |      Yes | Error Code        |
| created_at   | TIMESTAMP |       No | 作成日時          |
| started_at   | TIMESTAMP |      Yes | 開始日時          |
| completed_at | TIMESTAMP |      Yes | 完了日時          |

---

# 45. processing_results Table

将来的なSchema：

| Column             | Type      | Nullable | Description        |
| ------------------ | --------- | -------: | ------------------ |
| id                 | UUID      |       No | Result ID          |
| job_id             | UUID      |       No | Job ID             |
| processed_image_id | UUID      |       No | Processed Image ID |
| created_at         | TIMESTAMP |       No | 作成日時           |

---

# 46. user_settings Table

将来的なSchema：

| Column           | Type      | Nullable | Description      |
| ---------------- | --------- | -------: | ---------------- |
| user_id          | UUID      |       No | User ID          |
| theme            | VARCHAR   |      Yes | Theme            |
| language         | VARCHAR   |      Yes | Language         |
| default_strength | DECIMAL   |      Yes | Default Strength |
| created_at       | TIMESTAMP |       No | 作成日時         |
| updated_at       | TIMESTAMP |       No | 更新日時         |

---

# 47. Primary Key

各EntityにはPrimary Keyを設定する。

基本的にはUUIDを使用する。

例：

```text
users.id
projects.id
images.id
palettes.id
palette_colors.id
processing_jobs.id
processing_results.id
```

---

# 48. Foreign Key

Entity間のRelationshipを明確にする。

例：

```text
projects.user_id
images.project_id
palettes.project_id
palette_colors.palette_id
processing_jobs.image_id
processing_results.job_id
```

---

# 49. Referential Integrity

Foreign Keyを利用して、存在しないParent Entityを参照しないようにする。

---

# 50. Cascade Delete

Project削除時などのCascade Deleteについては慎重に設計する。

例：

```text
Project
 ↓
Images
 ↓
Processing Jobs
```

など。

R2上の画像ObjectもDatabase削除と連動してCleanupする必要がある。

---

# 51. DatabaseとR2削除順序

DatabaseとR2の削除処理では、以下のようなFailure Scenarioを考慮する。

```text
Database Delete
      ↓
R2 Delete
```

または、

```text
R2 Delete
      ↓
Database Delete
```

のどちらを採用するかは実装時に決定する。

重要なのは、片方だけ削除されて不整合が発生しないようにすることである。

---

# 52. Orphan Object

R2にDatabaseから参照されなくなったObjectが残る状態をOrphan Objectとする。

定期的なCleanupやLifecycle Ruleなどで対応する。

---

# 53. Orphan Record

Databaseに存在するが、R2 Objectが存在しないRecordも考慮する。

Storage ServiceのError Handlingと組み合わせて検出・処理する。

---

# 54. Transaction

Databaseへ複数の変更を行う場合はTransactionを利用する。

例：

```text
Create Project
+
Create Palette
```

など。

---

# 55. TransactionとR2

R2操作とDatabase Transactionは同一Transactionとして扱えない。

そのため、Storage操作失敗時のRollback / Cleanup処理をApplication Layerで設計する。

---

# 56. Database Connection

BackendからDatabaseへ接続する場合、Connection Poolを利用する。

不要なConnectionを大量に作成しない。

---

# 57. Database Configuration

Database Connection StringなどのSecretはEnvironment Variableで管理する。

例：

```text
DATABASE_URL
```

---

# 58. Database Secret

以下をGit RepositoryへCommitしない。

```text
DATABASE_URL
Database Password
Database API Key
Database Token
```

---

# 59. Database Security

DatabaseはFrontendから直接アクセスできない構成とする。

```text
Frontend
    X
    │
    X
Database

Frontend
    ↓
Backend
    ↓
Database
```

---

# 60. Authorization

Authenticationを導入した場合、Userが自分のProject / ImageのみアクセスできるようAuthorizationを行う。

例：

```text
User A
 ↓
Project A
 ↓
Image A
```

は許可。

```text
User A
 ↓
Project B
 ↓
Image B
```

は拒否。

---

# 61. IDOR対策

Database IDを知っているだけでResourceへアクセスできないようにする。

Backendで、

```text
Request User
+
Resource Owner
```

を確認する。

---

# 62. User Data Isolation

User単位でデータを分離する。

```text
User A
├── Project A
├── Image A
└── Palette A

User B
├── Project B
├── Image B
└── Palette B
```

---

# 63. Soft Delete

ProjectやImageなどを削除する場合、必要に応じてSoft Deleteを検討する。

例：

```text
deleted_at
```

ただし、MVPでは必須としない。

---

# 64. Hard Delete

PrivacyやStorage削除を重視する場合、Hard Deleteを利用する。

特にユーザーが削除を要求した画像については、R2 Objectも適切に削除する。

---

# 65. Data Retention

不要なデータを長期間保存しない。

対象：

```text
Images
Processing Jobs
Processing Results
Logs
```

---

# 66. Expiration

Image Metadataに、

```text
expires_at
```

を保存する設計を検討する。

Expiration後にR2 Objectを削除する。

---

# 67. Database Cleanup

不要になったProcessing JobやTemporary MetadataをCleanupする。

---

# 68. Index

将来的にDatabaseを導入した場合、検索条件に応じてIndexを作成する。

候補：

```text
users.email
projects.user_id
images.project_id
images.created_at
processing_jobs.image_id
processing_jobs.status
```

---

# 69. Indexの原則

Indexを過剰に作成しない。

Read PerformanceとWrite PerformanceのBalanceを考慮する。

---

# 70. Unique Constraint

必要なFieldにはUnique Constraintを設定する。

例：

```text
users.email
```

ただしAuthentication ProviderによってはProvider側で管理する。

---

# 71. NOT NULL

必須FieldにはNOT NULLを設定する。

例：

```text
images.id
images.mime_type
images.file_size
images.width
images.height
```

---

# 72. CHECK Constraint

Database側でも可能な範囲で値の整合性を保証する。

例：

```text
ratio >= 0
ratio <= 100
```

ただし、複数RowにまたがるBusiness RuleはApplication Layerで検証する。

---

# 73. Timestamp

基本的に、

```text
created_at
updated_at
```

を管理する。

必要に応じて、

```text
deleted_at
expires_at
started_at
completed_at
```

などを追加する。

---

# 74. Timezone

Timestampは一貫したTimezoneで管理する。

基本的にはUTCで保存し、Frontend表示時に必要なTimezoneへ変換する。

---

# 75. Database Migration

Databaseを導入する場合、Schema変更はMigrationで管理する。

例：

```text
Migration 001
Migration 002
Migration 003
```

など。

---

# 76. Migrationの原則

Production Databaseを直接手動変更しない。

Migrationを利用してSchema変更を管理する。

---

# 77. Migration Review

Migrationを追加する場合、

- [ ] Data Lossがないか
- [ ] Rollback可能か
- [ ] Indexが適切か
- [ ] Constraintが適切か
- [ ] Applicationと整合しているか

を確認する。

---

# 78. ORM

Databaseを導入する場合、ORMを利用することを検討する。

候補：

```text
SQLAlchemy
SQLModel
```

など。

最終的なORMはBackend Architectureとの整合性を考慮して決定する。

---

# 79. SQL

複雑なQueryでは、ORMだけに依存せずSQLを利用する場合がある。

ただし、SQL Injectionを防止するためParameter Bindingを利用する。

---

# 80. SQL Injection

User InputをSQLへ直接文字列連結しない。

悪い例：

```python
query = f"SELECT * FROM users WHERE id = '{user_id}'"
```

Parameter BindingまたはORMを使用する。

---

# 81. Database Error

Database ErrorをFrontendへ直接返さない。

例えば、

```text
PostgreSQL Error
```

などの内部情報を公開しない。

---

# 82. Database Error Handling

概念：

```text
Database Exception
 ↓
Repository / Service
 ↓
Domain Error
 ↓
API Error
```

---

# 83. Database Logging

Database QueryやCredentialsを無条件にLogへ出力しない。

ProductionではDebug SQL Loggingを適切に制限する。

---

# 84. Performance Monitoring

将来的にDatabaseを導入した場合、

```text
Query Time
Connection Count
Slow Query
Error Rate
```

などを監視する。

---

# 85. Backup

Databaseを導入した場合、Backup Policyを定義する。

対象：

```text
Database
```

ただし、MVPでDatabaseを使用しない場合は不要。

---

# 86. Disaster Recovery

Database導入後は、

```text
Backup
↓
Recovery
```

をテストする。

---

# 87. Privacy

Databaseには必要最小限のユーザー情報のみ保存する。

特に、

```text
Email
User Settings
Project Data
```

などの保存目的を明確にする。

---

# 88. Personal Data Minimization

必要のない個人情報を保存しない。

例えば、

```text
氏名
住所
電話番号
```

などを、機能上必要でなければ保存しない。

---

# 89. Image Privacy

Databaseには画像Binaryを保存しない。

また、R2の画像保存期間を必要以上に長くしない。

---

# 90. DatabaseとAnalytics

Analyticsを導入する場合、個人情報を必要以上に収集しない。

例：

```text
Processing Count
Processing Time
Error Count
```

など、必要最小限の匿名化された統計を優先する。

---

# 91. MVP Database Decision

ColorFit MVPでは、

```text
Database
↓
導入しない
```

とする。

理由：

- User Authenticationがない
- Project保存がない
- 永続的なUser Dataがない
- Processing結果を長期保存する必要がない
- R2だけで画像Storageを実現できる
- Application構成をシンプルにできる

---

# 92. MVPで保存するデータ

MVPでは主に、

```text
Original Image
Processed Image
```

を扱う。

これらはR2へ保存する。

---

# 93. MVPで保存しないデータ

原則として以下を永続Databaseへ保存しない。

```text
User
Project
Palette
Processing History
Processing Result Metadata
```

必要な処理状態はRequest / ResponseまたはTemporary Storageで管理する。

---

# 94. 将来的なDatabase導入Phase

## Phase 1

```text
Databaseなし
R2のみ
```

## Phase 2

```text
User
Project
Image Metadata
Palette
```

## Phase 3

```text
Processing Job
Processing Result
User Settings
```

## Phase 4

```text
Analytics
Usage History
Advanced Project Management
```

---

# 95. Database導入時のMigration

Database導入時は、既存R2 Objectとの関連付けを考慮する。

概念：

```text
Existing R2 Objects
        ↓
Metadata Import
        ↓
Database
```

ただし、MVPでDatabaseを使用しない場合、初期段階ではMigration処理を実装しない。

---

# 96. Database Architecture原則

ColorFitでは以下を原則とする。

1. MVPではDatabaseを無理に導入しない。
2. DatabaseはMetadataを管理する。
3. Image BinaryはR2へ保存する。
4. FrontendからDatabaseへ直接アクセスしない。
5. Backend経由でDatabaseへアクセスする。
6. Database AccessをService / Repositoryへ分離する。
7. User Dataを最小限にする。
8. R2とDatabaseの整合性を考慮する。
9. 不要なDataを長期間保存しない。
10. MigrationでSchemaを管理する。
11. SecretをEnvironment Variableで管理する。
12. Authentication導入時はAuthorizationを必須とする。

---

# 97. Database Architecture禁止事項

以下を原則として禁止する。

### Storage

- Databaseへ画像Binaryを大量保存しない
- R2 ObjectとDatabase Metadataの整合性を無視しない

### Security

- Database CredentialsをGitへCommitしない
- Database CredentialsをFrontendへ公開しない
- SQLへUser Inputを直接文字列連結しない

### Application

- FrontendからDatabaseへ直接アクセスしない
- Routerへ大量のDatabase Queryを書かない
- Database SchemaへBusiness Logicを過剰に依存しない

---

# 98. Database Test

Databaseを導入した場合は以下をテストする。

- [ ] Migration
- [ ] Insert
- [ ] Update
- [ ] Delete
- [ ] Foreign Key
- [ ] Unique Constraint
- [ ] NOT NULL
- [ ] CHECK Constraint
- [ ] Transaction
- [ ] Rollback
- [ ] Authorization
- [ ] IDOR
- [ ] Database Error
- [ ] R2との整合性

---

# 99. Database Test Environment

Test DatabaseはProduction Databaseと分離する。

```text
Development DB
Test DB
Production DB
```

を分離する。

---

# 100. Database Secret

各EnvironmentでDatabase Credentialsを分離する。

```text
Development
↓
Development Database

Test
↓
Test Database

Production
↓
Production Database
```

---

# 101. Database導入時のArchitecture

Database導入後：

```text
Frontend
    │
    ↓
FastAPI
    │
    ├──────────────┐
    ↓              ↓
Database        Storage
    │              │
Metadata        Image
```

---

# 102. 完了条件

Database設計は以下を満たすことを完了条件とする。

- [ ] MVPでDatabaseを使用しない方針が定義されている
- [ ] Database導入条件が定義されている
- [ ] DatabaseとR2の責務分担が定義されている
- [ ] 将来的なUser Entityが定義されている
- [ ] 将来的なProject Entityが定義されている
- [ ] Image Metadataが定義されている
- [ ] Palette Entityが定義されている
- [ ] Palette Color Entityが定義されている
- [ ] Processing Job Entityが定義されている
- [ ] Processing Result Entityが定義されている
- [ ] User Settings Entityが定義されている
- [ ] ER Diagramが定義されている
- [ ] Primary Keyが定義されている
- [ ] Foreign Keyが定義されている
- [ ] Index方針が定義されている
- [ ] Constraint方針が定義されている
- [ ] Transaction方針が定義されている
- [ ] Migration方針が定義されている
- [ ] Database Securityが定義されている
- [ ] Privacy方針が定義されている
- [ ] Data Retention方針が定義されている
- [ ] Database Test方針が定義されている
- [ ] 将来的なDatabase導入Phaseが定義されている

```

```
