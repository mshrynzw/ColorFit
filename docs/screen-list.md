# ColorFit 画面一覧

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおける画面一覧、Route、画面の目的、主要なComponent、入力項目、API、画面遷移などを一覧化する。

本書を参照することで、ColorFitのFrontendに存在する画面と、それぞれの役割を把握できるようにする。

---

# 2. 画面構成

ColorFitのMVPでは、以下の4画面を基本とする。

| No. | 画面名   | Route       | UI Reference  |
| --- | -------- | ----------- | ------------- |
| 01  | Home     | `/`         | `01-home`     |
| 02  | Editor   | `/editor`   | `02-editor`   |
| 03  | Result   | `/result`   | `03-result`   |
| 04  | Settings | `/settings` | `04-settings` |

---

# 3. 画面遷移

基本的なUser Flowは以下とする。

```text
Home
  │
  │ 「ColorFitを使う」
  ▼
Editor
  │
  │ 画像Upload
  │ Palette設定
  │ Ratio設定
  │ Strength設定
  │
  │ 「カラーリングを実行」
  ▼
Result
  │
  ├──────────────┐
  │              │
  │              │
  ▼              ▼
Download      Editorへ戻る
```

SettingsはHeaderなどのNavigationからアクセスする。

```text
Home ──────┐
           │
Editor ────┼──→ Settings
           │
Result ────┘
```

---

# 4. Screen ID

各画面には以下のScreen IDを付与する。

```text
SCR-001 Home
SCR-002 Editor
SCR-003 Result
SCR-004 Settings
```

---

# 5. SCR-001 Home

## 5.1 基本情報

| 項目           | 内容                        |
| -------------- | --------------------------- |
| Screen ID      | SCR-001                     |
| Screen Name    | Home                        |
| 日本語名       | ホーム                      |
| Route          | `/`                         |
| UI Reference   | `docs/ui-reference/01-home` |
| Authentication | 不要                        |
| Primary Action | ColorFitを使う              |
| Responsive     | 対応                        |
| Theme          | Dark                        |

---

## 5.2 画面目的

ColorFitがどのようなWebアプリなのかをユーザーへ伝え、Editorへ誘導する。

主な目的：

- ColorFitの紹介
- ApplicationのValue Proposition提示
- Main CTAの提示
- Feature紹介
- EditorへのNavigation

---

## 5.3 主なUI

```text
Home
├── Header
├── Hero
│   ├── Title
│   ├── Description
│   └── CTA
│
├── Feature Section
│   ├── Feature Card
│   ├── Feature Card
│   └── Feature Card
│
├── CTA Section
└── Footer
```

---

## 5.4 主なComponent

```text
Header
HeroSection
FeatureSection
FeatureCard
CTASection
Footer
Button
```

---

## 5.5 Primary CTA

例：

```text
ColorFitを使う
```

遷移先：

```text
/editor
```

---

## 5.6 Secondary Navigation

Headerから以下へ遷移できる。

```text
Editor
Settings
```

---

## 5.7 API

MVPでは基本的にAPIを使用しない。

---

## 5.8 State

Homeでは複雑なApplication Stateを持たない。

---

## 5.9 Animation

Heroなどに近未来的なAnimationを使用する。

候補：

```text
Gradient
Glow
Grid
Particle
Text Animation
```

---

## 5.10 Responsive

Desktop：

```text
Heroを大きく表示
Featureを複数Column
```

Mobile：

```text
HeroをVertical Layout
FeatureをSingle Column
```

---

# 6. SCR-002 Editor

## 6.1 基本情報

| 項目           | 内容                          |
| -------------- | ----------------------------- |
| Screen ID      | SCR-002                       |
| Screen Name    | Editor                        |
| 日本語名       | エディター                    |
| Route          | `/editor`                     |
| UI Reference   | `docs/ui-reference/02-editor` |
| Authentication | 不要                          |
| Primary Action | カラーリングを実行            |
| Responsive     | 対応                          |
| Theme          | Dark                          |

---

## 6.2 画面目的

Webデザイン画像と配色情報を入力し、ColorFitによるImage Processingを実行する。

ColorFitの主要画面。

---

## 6.3 Editor Flow

```text
画像をUpload
    ↓
画像Preview
    ↓
Palette設定
    ↓
配色比率設定
    ↓
適用強度設定
    ↓
カラーリング実行
```

---

# 7. Editor UI構成

```text
Editor
├── Header
│
├── EditorLayout
│   │
│   ├── ImageEditorPanel
│   │   ├── ImageUploader
│   │   └── ImagePreview
│   │
│   └── ColorSettingsPanel
│       ├── PaletteEditor
│       ├── ColorPicker
│       ├── RatioEditor
│       └── StrengthSlider
│
├── ProcessingPanel
│   ├── ProcessingIndicator
│   └── ProcessingButton
│
└── Footer
```

---

# 8. Editor Components

主要Component：

```text
EditorLayout
ImageEditorPanel
ImageUploader
ImagePreview
ColorSettingsPanel
PaletteEditor
PaletteColorItem
ColorPicker
ColorInput
RatioEditor
StrengthSlider
ProcessingPanel
ProcessingIndicator
ProcessingButton
```

---

# 9. Image Upload

ユーザーはWebデザイン画像をUploadする。

対応するUI：

```text
ImageUploader
```

---

## 9.1 Upload方法

基本：

```text
File選択
Drag & Drop
```

---

## 9.2 Upload State

```text
Idle
Uploading
Success
Error
```

---

## 9.3 Upload Validation

以下をFrontend / Backend双方でValidationする。

```text
File Type
File Size
Image Format
Image Integrity
```

詳細は、

```text
03_detail-design/06_error-handling.md
03_detail-design/07_security.md
```

を参照する。

---

# 10. Image Preview

Uploadした画像をEditor内にPreview表示する。

Component：

```text
ImagePreview
```

---

## 10.1 Preview要件

- Responsive
- Aspect Ratio維持
- Loading対応
- Error対応

---

# 11. Palette設定

ユーザーがWebデザインに使用しているColorを入力する。

Component：

```text
PaletteEditor
```

---

## 11.1 Palette項目

Colorごとに、

```text
Color
Ratio
```

を設定する。

---

## 11.2 Color入力

HEX Colorを基本とする。

例：

```text
#00D9FF
#6C5CE7
#FFFFFF
```

---

## 11.3 Color操作

ユーザーは、

```text
Color追加
Color変更
Color削除
```

を行える。

---

# 12. Ratio設定

Colorごとの使用割合を設定する。

例：

```text
Primary      60%
Secondary    30%
Accent       10%
```

---

## 12.1 Ratio Validation

Palette全体のRatio合計は、

```text
100%
```

である必要がある。

---

# 13. Strength設定

画像へ配色を適用する強度を設定する。

Component：

```text
StrengthSlider
```

---

## 13.1 Strength

概念：

```text
弱い
    ↓
    ─────────●────
                  ↓
                 強い
```

具体的な値域はBackend仕様に従う。

---

# 14. Processing

ユーザーが、

```text
カラーリングを実行
```

を押すことでImage Processingを開始する。

Component：

```text
ProcessingButton
```

---

# 15. Processing API

FrontendからBackendへProcessing Requestを送信する。

概念：

```text
ProcessingButton
 ↓
useImageProcessing
 ↓
API Client
 ↓
FastAPI
```

---

# 16. Processing State

```text
Ready
Processing
Success
Error
```

---

# 17. Processing表示

Processing中はユーザーへ現在処理中であることを伝える。

例：

```text
画像を解析しています...
カラーリングしています...
画像を生成しています...
```

---

# 18. Processing完了後

Processingが成功した場合、

```text
/result
```

へ遷移する。

---

# 19. Processing Error

Processingに失敗した場合はEditor画面上でErrorを表示する。

例：

```text
画像を処理できませんでした。
画像を確認して、もう一度お試しください。
```

必要に応じて、

```text
もう一度試す
```

を表示する。

---

# 20. Editor State

Editorで管理する主要State：

```text
selectedFile
imageId
previewUrl

palette
ratio
strength

processingStatus
processingError
result
```

---

# 21. Editor API

Editorで使用する主なAPI：

```text
POST /api/images
POST /api/images/{imageId}/process
```

詳細は、

```text
06_api.md
```

を参照する。

---

# 22. Editor Responsive

## Desktop

```text
┌───────────────────────────────────────┐
│ Header                                │
├───────────────────┬───────────────────┤
│                   │                   │
│ Image Preview     │ Color Settings   │
│                   │                   │
│                   │ Palette           │
│                   │ Ratio             │
│                   │ Strength          │
│                   │                   │
├───────────────────┴───────────────────┤
│          Processing Button            │
└───────────────────────────────────────┘
```

---

## Mobile

```text
┌──────────────────────┐
│ Header               │
├──────────────────────┤
│ Image Preview        │
├──────────────────────┤
│ Palette              │
├──────────────────────┤
│ Ratio                │
├──────────────────────┤
│ Strength             │
├──────────────────────┤
│ Processing Button    │
└──────────────────────┘
```

---

# 23. SCR-003 Result

## 23.1 基本情報

| 項目           | 内容                          |
| -------------- | ----------------------------- |
| Screen ID      | SCR-003                       |
| Screen Name    | Result                        |
| 日本語名       | 結果                          |
| Route          | `/result`                     |
| UI Reference   | `docs/ui-reference/03-result` |
| Authentication | 不要                          |
| Primary Action | 結果をダウンロード            |
| Responsive     | 対応                          |
| Theme          | Dark                          |

---

# 24. Result画面目的

ColorFitによって生成された画像をユーザーへ提示する。

主な目的：

- Processing完了の通知
- Before / After比較
- Processed Image表示
- Processing情報表示
- Image Download
- EditorへのReturn

---

# 25. Result UI構成

```text
Result
├── Header
│
├── ResultHero
│
├── ImageComparison
│   ├── OriginalImage
│   └── ProcessedImage
│
├── ResultInfo
│
├── DownloadButton
│
├── BackToEditorButton
│
└── Footer
```

---

# 26. ResultHero

Processing完了をユーザーへ伝える。

例：

```text
カラーリングが完成しました。
```

---

# 27. ImageComparison

Original ImageとProcessed Imageを比較する。

---

## 27.1 Comparison

基本：

```text
Before
After
```

日本語：

```text
変更前
変更後
```

---

## 27.2 Comparison UI

DesktopではSide-by-Sideを基本とする。

```text
┌─────────────────┬─────────────────┐
│                 │                 │
│    Original     │    Processed    │
│                 │                 │
└─────────────────┴─────────────────┘
```

MobileではVertical Layoutも利用する。

```text
┌─────────────────┐
│    Original     │
└─────────────────┘

        ↓

┌─────────────────┐
│    Processed    │
└─────────────────┘
```

---

# 28. ResultInfo

Processing結果の情報を表示する。

例：

```text
Processing Complete
Color Palette
Strength
Image Format
```

日本語UIの場合は適切な日本語へ置き換える。

---

# 29. Download

Processed ImageをDownloadする。

Component：

```text
DownloadButton
```

---

## 29.1 Download Flow

```text
DownloadButton
 ↓
API Client
 ↓
Backend
 ↓
Storage
 ↓
Image Download
```

---

# 30. Back to Editor

ResultからEditorへ戻る。

Component：

```text
BackToEditorButton
```

遷移：

```text
/result
   ↓
/editor
```

---

# 31. Result API

Result画面で必要なAPIは、

```text
GET /api/images/{imageId}
GET /api/images/{imageId}/download
```

などを基本とする。

詳細は、

```text
06_api.md
```

を参照する。

---

# 32. Result State

```text
result
originalImage
processedImage
resultInfo
downloadStatus
error
```

---

# 33. Result Responsive

Desktop：

```text
Result Status
      ↓
Before / After
      ↓
Result Info
      ↓
Download
```

Mobile：

```text
Result Status
      ↓
Original
      ↓
Processed
      ↓
Result Info
      ↓
Download
```

---

# 34. SCR-004 Settings

## 34.1 基本情報

| 項目           | 内容                            |
| -------------- | ------------------------------- |
| Screen ID      | SCR-004                         |
| Screen Name    | Settings                        |
| 日本語名       | 設定                            |
| Route          | `/settings`                     |
| UI Reference   | `docs/ui-reference/04-settings` |
| Authentication | 不要                            |
| Primary Action | 設定変更                        |
| Responsive     | 対応                            |
| Theme          | Dark                            |

---

# 35. Settings画面目的

ColorFitのApplication設定を管理する。

MVPでは必要最低限の設定を実装し、将来的に拡張可能な構造とする。

---

# 36. Settings UI構成

```text
Settings
├── Header
│
├── SettingsLayout
│   ├── AppearanceSettings
│   │   └── ThemeSelector
│   │
│   ├── ProcessingSettings
│   │
│   └── AboutSettings
│
└── Footer
```

---

# 37. Appearance Settings

Appearanceに関する設定を管理する。

候補：

```text
Theme
Animation
```

---

# 38. Theme

将来的に、

```text
Dark
Light
System
```

などを検討する。

MVPではDark Themeを基本とする。

---

# 39. Animation Settings

Animationの有効 / 無効などを将来的に提供できる。

---

# 40. Processing Settings

Image Processingに関する設定を将来的に追加する。

MVPで未実装の項目はUIのみ作成しても、実際の処理を実装する必要はない。

---

# 41. About Settings

Application情報を表示する。

例：

```text
ColorFit
Version
Technology
License
```

---

# 42. Settings State

例：

```text
theme
animationEnabled
processingSettings
```

---

# 43. Settings Storage

Settingsの保存方法は、

```text
Local Storage
```

などを基本候補とする。

具体的なStorage仕様は、

```text
03_detail-design/05_storage.md
```

を参照する。

---

# 44. Settings API

MVPではServer APIを必要としない設定はFrontend Local State / Local Storageで管理する。

---

# 45. Settings Responsive

Desktop：

```text
┌───────────────────────────────┐
│ Settings                      │
├───────────────────────────────┤
│ Appearance                    │
│ Theme                 [Dark]  │
│                               │
│ Processing                    │
│ ...                           │
│                               │
│ About                         │
│ ...                           │
└───────────────────────────────┘
```

Mobile：

```text
┌──────────────────────┐
│ Settings             │
├──────────────────────┤
│ Appearance           │
├──────────────────────┤
│ Theme                │
├──────────────────────┤
│ Processing           │
├──────────────────────┤
│ About                │
└──────────────────────┘
```

---

# 46. Common Header

以下の画面では共通Headerを使用する。

```text
Home
Editor
Result
Settings
```

Component：

```text
Header
Navigation
```

---

# 47. Common Footer

基本的に以下の画面でFooterを使用する。

```text
Home
Editor
Result
Settings
```

---

# 48. Common Navigation

Navigationでは以下のRouteを扱う。

```text
/
 /editor
 /settings
```

Resultへの直接Navigationは基本的にEditor Processing後のFlowを優先する。

---

# 49. Route一覧

| Screen ID | Screen   | Route       |
| --------- | -------- | ----------- |
| SCR-001   | Home     | `/`         |
| SCR-002   | Editor   | `/editor`   |
| SCR-003   | Result   | `/result`   |
| SCR-004   | Settings | `/settings` |

---

# 50. Route遷移一覧

| From     | Action              | To       |
| -------- | ------------------- | -------- |
| Home     | ColorFitを使う      | Editor   |
| Home     | Editor Navigation   | Editor   |
| Home     | Settings Navigation | Settings |
| Editor   | Processing成功      | Result   |
| Editor   | Settings Navigation | Settings |
| Result   | Download            | Download |
| Result   | Editorへ戻る        | Editor   |
| Result   | Settings Navigation | Settings |
| Settings | Editor Navigation   | Editor   |
| Settings | Home Navigation     | Home     |

---

# 51. Screen Access

MVPでは基本的に全画面をGuest Userが利用できる。

```text
Authentication
不要
```

---

# 52. Screen Loading

各画面では必要に応じてLoading Stateを用意する。

対象：

```text
Editor
Result
```

---

# 53. Screen Error

各画面ではError Stateを用意する。

対象：

```text
Editor
Result
```

Home / Settingsについては、基本的に大規模なAPI Errorを想定しない。

---

# 54. Screen Empty State

主にEditorで使用する。

例：

```text
まだ画像がアップロードされていません。
```

---

# 55. Screen Responsive

すべての画面でResponsive Designを実装する。

対応：

```text
Mobile
Tablet
Desktop
Large Desktop
```

---

# 56. Screen Animation

各画面でAnimationを利用できる。

| Screen   | Animation                |
| -------- | ------------------------ |
| Home     | Hero / Background / CTA  |
| Editor   | Upload / Processing      |
| Result   | Result Reveal / Image    |
| Settings | Transition / Interaction |

---

# 57. Screen Accessibility

すべてのScreenで以下を考慮する。

- Keyboard Navigation
- Focus
- Color Contrast
- Screen Reader
- Reduced Motion
- Form Label
- Error Message
- Image Alt

---

# 58. Screen Performance

Performance上特に注意する画面：

```text
Editor
Result
```

理由：

- 大きな画像を扱う
- Image Previewを表示する
- Processing Stateを扱う
- Animationを使用する可能性がある

---

# 59. Screen Security

Frontendから以下を公開しない。

```text
API Secret
R2 Secret
Backend Secret
Private Credential
```

---

# 60. Screen Data Flow

## Home

```text
User
 ↓
Home
 ↓
Editor
```

---

## Editor

```text
User
 ↓
Image Upload
 ↓
Backend
 ↓
Image ID
 ↓
Palette Input
 ↓
Processing
 ↓
Backend
 ↓
Result
```

---

## Result

```text
Result
 ↓
Original / Processed
 ↓
Download
```

---

## Settings

```text
User
 ↓
Settings
 ↓
Local Settings
```

---

# 61. Screen Component Mapping

| Screen   | Main Components                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Home     | Header, HeroSection, FeatureSection, CTASection, Footer                                   |
| Editor   | ImageUploader, ImagePreview, PaletteEditor, RatioEditor, StrengthSlider, ProcessingButton |
| Result   | ResultHero, ImageComparison, ResultInfo, DownloadButton, BackToEditorButton               |
| Settings | AppearanceSettings, ThemeSelector, ProcessingSettings, AboutSettings                      |

---

# 62. ScreenとAPI対応

| Screen   | API                       |
| -------- | ------------------------- |
| Home     | なし                      |
| Editor   | Image Upload / Processing |
| Result   | Result取得 / Download     |
| Settings | 原則なし                  |

---

# 63. ScreenとStorage対応

| Screen   | Storage                    |
| -------- | -------------------------- |
| Home     | なし                       |
| Editor   | Upload Image               |
| Result   | Original / Processed Image |
| Settings | Local Storage              |

---

# 64. ScreenとImage Processing対応

| Screen   | Image Processing   |
| -------- | ------------------ |
| Home     | なし               |
| Editor   | Processing開始     |
| Result   | Processing結果表示 |
| Settings | Processing設定     |

---

# 65. ScreenとColor Matching対応

| Screen   | Color Matching                 |
| -------- | ------------------------------ |
| Home     | なし                           |
| Editor   | Palette / Ratio / Strength入力 |
| Result   | 結果確認                       |
| Settings | 将来拡張                       |

---

# 66. User Journey

基本User Journey：

```text
① Home
   ↓
② ColorFitの概要を確認
   ↓
③ Editorへ移動
   ↓
④ Webデザイン画像をUpload
   ↓
⑤ Paletteを入力
   ↓
⑥ 配色比率を設定
   ↓
⑦ 適用強度を設定
   ↓
⑧ カラーリングを実行
   ↓
⑨ Processing
   ↓
⑩ Result
   ↓
⑪ Before / After確認
   ↓
⑫ Download
```

---

# 67. Screen State Matrix

| Screen   | Default | Loading | Error | Empty | Success |
| -------- | ------- | ------- | ----- | ----- | ------- |
| Home     | ○       | -       | -     | -     | -       |
| Editor   | ○       | ○       | ○     | ○     | ○       |
| Result   | ○       | ○       | ○     | -     | ○       |
| Settings | ○       | -       | -     | -     | ○       |

---

# 68. Editor State Matrix

| State            | UI                   |
| ---------------- | -------------------- |
| 初期状態         | Upload UI            |
| Image選択        | Preview表示          |
| Upload中         | Loading              |
| Upload成功       | Editor操作可能       |
| Validation Error | Error表示            |
| Processing中     | Processing Indicator |
| Processing成功   | Resultへ遷移         |
| Processing Error | Error + Retry        |

---

# 69. Result State Matrix

| State            | UI                |
| ---------------- | ----------------- |
| Loading          | Loading Indicator |
| Success          | Result表示        |
| Downloading      | Download Loading  |
| Download Success | Success Feedback  |
| Error            | Error Panel       |

---

# 70. Settings State Matrix

| State   | UI               |
| ------- | ---------------- |
| Default | Current Settings |
| Changed | Updated Settings |
| Saved   | Success Feedback |

---

# 71. MVP Screen Scope

MVPでは以下の4画面を実装対象とする。

```text
SCR-001 Home
SCR-002 Editor
SCR-003 Result
SCR-004 Settings
```

---

# 72. MVPで実装しない画面

以下はMVPでは原則として作成しない。

```text
Login
Signup
User Profile
Dashboard
History
Admin
Billing
Subscription
```

将来的に必要になった場合に追加する。

---

# 73. Future Screen候補

将来的に以下の画面を追加できる。

```text
History
Saved Projects
User Profile
Account
Image Library
Color Palette Library
Processing History
```

---

# 74. Screen追加ルール

新しいScreenを追加する場合は、

1. Requirements更新
2. Basic Design更新
3. Screen List更新
4. UI Reference作成
5. Component Design更新
6. API Design更新
7. Architecture確認
8. Implementation
9. Test
10. Visual QA

の順で検討する。

---

# 75. Screen ID追加ルール

新しいScreenは、

```text
SCR-005
SCR-006
SCR-007
```

のように連番で追加する。

既存Screen IDは原則変更しない。

---

# 76. UI Referenceとの対応

ScreenとUI Referenceは以下のように対応する。

```text
SCR-001
 ↓
docs/ui-reference/01-home

SCR-002
 ↓
docs/ui-reference/02-editor

SCR-003
 ↓
docs/ui-reference/03-result

SCR-004
 ↓
docs/ui-reference/04-settings
```

---

# 77. Screen実装順序

基本的な実装順序：

```text
Home
 ↓
Editor
 ↓
Result
 ↓
Settings
```

ただしBackend / Image Processingなどの開発状況に応じて変更してよい。

---

# 78. Screen開発優先順位

Priority：

```text
P0
Editor

P0
Result

P1
Home

P1
Settings
```

ColorFitのCore ValueはEditor → Processing → Resultにあるため、機能実装ではEditorとResultを最優先とする。

---

# 79. Screen QA Checklist

各Screen実装後に以下を確認する。

### Visual

- [ ] UI Referenceと一致している
- [ ] Layoutが正しい
- [ ] Colorが正しい
- [ ] Typographyが正しい
- [ ] Spacingが正しい
- [ ] Componentが正しい
- [ ] Animationが正しい

### Functional

- [ ] Navigationが動作する
- [ ] Buttonが動作する
- [ ] Formが動作する
- [ ] APIが正しく呼ばれる
- [ ] Errorが表示される
- [ ] Loadingが表示される

### Responsive

- [ ] Mobile
- [ ] Tablet
- [ ] Desktop
- [ ] Large Desktop

### Accessibility

- [ ] Keyboard
- [ ] Focus
- [ ] Contrast
- [ ] Screen Reader
- [ ] Reduced Motion

---

# 80. Screen一覧サマリー

| ID      | Screen   | Route       | 目的                            | Priority |
| ------- | -------- | ----------- | ------------------------------- | -------- |
| SCR-001 | Home     | `/`         | ColorFit紹介・Editor誘導        | P1       |
| SCR-002 | Editor   | `/editor`   | Image / Palette入力・Processing | P0       |
| SCR-003 | Result   | `/result`   | Before / After・Download        | P0       |
| SCR-004 | Settings | `/settings` | Application設定                 | P1       |

---

# 81. Screen Architecture

ColorFitの画面構成：

```text
                         ColorFit
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        Home              Editor           Settings
          │                 │
          │                 │
          │          ┌──────┴──────┐
          │          │             │
          │       Upload        Palette
          │          │             │
          │          └──────┬──────┘
          │                 │
          │             Processing
          │                 │
          │                 ▼
          │               Result
          │                 │
          │              Download
          │
          └───────────────────────────────────
```

---

# 82. 最重要User Flow

ColorFitのCore User Flowは以下とする。

```text
Home
 ↓
Editor
 ↓
Upload Image
 ↓
Set Color Palette
 ↓
Set Color Ratio
 ↓
Set Strength
 ↓
Process
 ↓
Result
 ↓
Download
```

このFlowをColorFitのMVPにおける最重要User Journeyとする。

---

# 83. 完了条件

Screen Listは以下を満たすことを完了条件とする。

- [ ] すべてのMVP Screenが定義されている
- [ ] Screen IDが定義されている
- [ ] Screen Nameが定義されている
- [ ] Routeが定義されている
- [ ] Screen目的が定義されている
- [ ] UI Referenceとの対応が定義されている
- [ ] Componentが定義されている
- [ ] APIとの関係が定義されている
- [ ] Storageとの関係が定義されている
- [ ] Image Processingとの関係が定義されている
- [ ] Color Matchingとの関係が定義されている
- [ ] Screen Stateが定義されている
- [ ] Screen遷移が定義されている
- [ ] Responsive方針が定義されている
- [ ] Accessibility方針が定義されている
- [ ] Animation方針が定義されている
- [ ] MVP Scopeが定義されている
- [ ] Future Screen候補が定義されている
- [ ] Screen QA項目が定義されている
