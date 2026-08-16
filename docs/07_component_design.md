# ColorFit Component設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitのFrontendにおけるReact Componentの設計方針、責務、階層構造、再利用方針を定義する。

対象：

- Page Component
- Layout Component
- Feature Component
- UI Component
- Form Component
- Feedback Component
- Image Component
- Navigation Component
- Component間のデータ受け渡し
- State管理
- Componentの責務分離
- Responsive Design
- Accessibility
- Animation

---

# 2. Component設計基本方針

ColorFitでは以下を基本方針とする。

1. Componentごとの責務を明確にする。
2. 一つのComponentへ責務を集中させすぎない。
3. 再利用可能なUIは共通Componentとして切り出す。
4. Page Componentは画面全体のCompositionを担当する。
5. Business LogicをUI Componentへ直接記述しない。
6. API通信をUI Componentへ直接記述しない。
7. API通信はCustom Hook / API Clientへ分離する。
8. Form Stateは必要に応じてCustom Hookで管理する。
9. Image Processingの処理自体はFrontendで行わない。
10. Backendとの通信はAPI Clientを経由する。
11. Responsive Designを前提とする。
12. Accessibilityを考慮する。
13. AnimationはUI体験を向上させる目的で使用する。
14. 過剰なComponent分割を行わない。
15. UI ReferenceのデザインをComponent設計へ反映する。

---

# 3. Component Architecture

ColorFitでは以下の階層を基本とする。

```text
Page
 ↓
Feature Component
 ↓
UI Component
 ↓
Primitive Component
```

概念：

```text
Page
├── Feature
│   ├── Feature
│   └── UI
│
└── UI
```

---

# 4. Component Layer

Componentを以下のLayerに分類する。

```text
Page
Layout
Feature
UI
Form
Feedback
Image
Navigation
```

---

# 5. Page Component

Page ComponentはReact RouterのRouteに対応する。

基本：

```text
HomePage
EditorPage
ResultPage
SettingsPage
```

Page Componentは、

- Component配置
- Page Layout
- Page単位のState
- Feature ComponentのComposition

を担当する。

---

# 6. Page Componentで行わないこと

Page Componentへ以下を大量に記述しない。

- Image Processing Logic
- Color Matching Algorithm
- API Request処理
- Storage処理
- 複雑なValidation
- 大量のBusiness Logic

これらは適切なLayerへ分離する。

---

# 7. HomePage

Route：

```text
/
```

役割：

- ColorFitの紹介
- Applicationへの入口
- EditorへのNavigation
- Hero Section
- Feature紹介
- CTA

概念：

```text
HomePage
├── Header
├── HeroSection
├── FeatureSection
├── CTASection
└── Footer
```

---

# 8. EditorPage

Route：

```text
/editor
```

ColorFitの主要画面。

役割：

- Image Upload
- Image Preview
- Color Palette設定
- Ratio設定
- Strength設定
- Processing開始

概念：

```text
EditorPage
├── Header
├── EditorLayout
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
└── ProcessingButton
```

---

# 9. ResultPage

Route：

```text
/result
```

役割：

- Original Image表示
- Processed Image表示
- Before / After比較
- Result情報表示
- Download
- Editorへ戻る

概念：

```text
ResultPage
├── Header
├── ResultHero
├── ImageComparison
│   ├── OriginalImage
│   └── ProcessedImage
├── ResultInfo
├── DownloadButton
└── BackToEditorButton
```

---

# 10. SettingsPage

Route：

```text
/settings
```

役割：

- Application Settings
- UI Settings
- Theme
- その他設定

概念：

```text
SettingsPage
├── Header
├── SettingsLayout
│   ├── AppearanceSettings
│   ├── ProcessingSettings
│   └── AboutSettings
└── Footer
```

MVPで実装しないSettingsはUIとして存在させても、実際の機能を持たせる必要はない。

---

# 11. Layout Component

Layout Componentは画面全体の共通構造を担当する。

例：

```text
AppLayout
Header
Main
Footer
```

---

# 12. AppLayout

Application全体のLayout。

概念：

```text
AppLayout
├── Header
├── Main
└── Footer
```

必要に応じてRouteごとのLayoutを追加する。

---

# 13. Header

HeaderはNavigationとApplication Brandingを担当する。

表示内容：

```text
ColorFit Logo
Navigation
Settings
```

など。

---

# 14. Footer

FooterはApplication情報などを表示する。

例：

```text
ColorFit
Copyright
Links
```

---

# 15. Feature Component

Feature ComponentはColorFit固有の機能単位でComponent化する。

例：

```text
ImageUploader
PaletteEditor
ImageComparison
ProcessingPanel
```

---

# 16. UI Component

UI ComponentはApplication全体で再利用可能なUIを担当する。

例：

```text
Button
Input
Slider
Card
Dialog
Badge
Tooltip
```

---

# 17. Primitive Component

Primitive Componentは最小単位のUI。

例：

```text
Button
Input
Label
Icon
Spinner
```

---

# 18. Component Naming

Component名はPascalCaseを使用する。

例：

```text
ImageUploader
PaletteEditor
ColorPicker
ProcessingButton
ResultComparison
```

---

# 19. Component File Naming

基本的にComponent名とFile名を一致させる。

例：

```text
ImageUploader.tsx
PaletteEditor.tsx
ColorPicker.tsx
```

---

# 20. Component Directory

基本構成：

```text
src/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── image/
│   ├── color/
│   ├── editor/
│   ├── result/
│   ├── settings/
│   └── feedback/
```

実装時にComponent数が増えた場合はFeature単位で整理する。

---

# 21. Feature Directory

ColorFit固有のFeatureは以下を基本とする。

```text
components/
├── image/
├── color/
├── editor/
├── result/
└── settings/
```

---

# 22. Image Components

Image関連Component：

```text
ImageUploader
ImagePreview
OriginalImage
ProcessedImage
ImageComparison
ImageInfo
```

---

# 23. ImageUploader

役割：

- File選択
- Drag & Drop
- File Type表示
- File Size表示
- Validation Error表示
- Upload開始

---

# 24. ImageUploaderが行わないこと

ImageUploader自体で、

- R2 Upload
- API Request
- Image Processing

を直接実装しない。

基本：

```text
ImageUploader
 ↓
useImageUpload
 ↓
API Client
 ↓
FastAPI
```

---

# 25. ImagePreview

Uploadされた画像をPreviewする。

Props例：

```ts
type ImagePreviewProps = {
  src: string;
  alt: string;
};
```

---

# 26. OriginalImage

Original Imageを表示する。

責務：

- Image Rendering
- Aspect Ratio維持
- Responsive表示

---

# 27. ProcessedImage

Processing後のImageを表示する。

責務：

- Processed Image Rendering
- Responsive表示
- Loading State

---

# 28. ImageComparison

OriginalとProcessedを比較するComponent。

概念：

```text
ImageComparison
├── OriginalImage
└── ProcessedImage
```

---

# 29. ImageComparisonのUI

以下の表示方法を検討する。

```text
Before / After
```

または、

```text
Slider Comparison
```

UI Referenceのデザインを優先する。

---

# 30. Color Components

Color関連Component：

```text
PaletteEditor
ColorPicker
ColorInput
PaletteColorItem
RatioEditor
RatioInput
StrengthSlider
```

---

# 31. PaletteEditor

Palette全体を管理するFeature Component。

概念：

```text
PaletteEditor
├── PaletteColorItem
├── PaletteColorItem
├── PaletteColorItem
└── AddColorButton
```

---

# 32. PaletteEditorの責務

- Color追加
- Color削除
- Color変更
- Ratio変更
- Palette Validation
- Palette表示

---

# 33. PaletteColorItem

Palette内の1Colorを表示・編集する。

Props例：

```ts
type PaletteColorItemProps = {
  color: string;
  ratio: number;
  name?: string;
  onColorChange: (color: string) => void;
  onRatioChange: (ratio: number) => void;
  onRemove: () => void;
};
```

---

# 34. ColorPicker

Colorを選択する。

入力方法：

- Color Picker
- HEX Input

など。

---

# 35. ColorInput

HEX Colorを直接入力する。

Validation：

```text
#RRGGBB
```

---

# 36. RatioEditor

Palette ColorのRatioを編集する。

例：

```text
Primary
60%

Secondary
30%

Accent
10%
```

---

# 37. Ratio Validation

Frontendでは、

```text
0 <= ratio <= 100
```

を確認する。

Palette全体では、

```text
SUM(ratio) = 100
```

を確認する。

ただしBackendでも必ず再Validationする。

---

# 38. StrengthSlider

Color MatchingのStrengthを指定する。

基本：

```text
0
～
1
```

---

# 39. Strength UI

例：

```text
弱い ─────────●─── 強い
```

実際のUIはUI Referenceを優先する。

---

# 40. Processing Components

Processing関連：

```text
ProcessingButton
ProcessingPanel
ProcessingIndicator
ProcessingStatus
```

---

# 41. ProcessingButton

Color Matching処理を開始する。

状態：

```text
Ready
Processing
Success
Error
```

---

# 42. ProcessingButton State

概念：

```text
idle
 ↓
processing
 ↓
success
```

Error：

```text
processing
 ↓
error
```

---

# 43. ProcessingButton Disable条件

以下の場合はButtonをDisabledにする。

```text
Image未Upload
Palette未設定
Ratio不正
Color不正
Processing中
```

---

# 44. ProcessingIndicator

Processing中であることをユーザーへ伝える。

Animationを使用してよい。

例：

```text
Color Matching...
```

---

# 45. ProcessingStatus

Processingの状態を表示する。

例：

```text
画像を解析しています...
配色を適用しています...
画像を生成しています...
```

MVPでは固定Messageでもよい。

---

# 46. Result Components

Result関連：

```text
ResultHero
ImageComparison
ResultInfo
DownloadButton
BackToEditorButton
```

---

# 47. ResultHero

Result Pageの主要Visualを担当する。

表示例：

```text
Your image is ready.
```

日本語：

```text
画像のカラーリングが完成しました。
```

---

# 48. ResultInfo

Processing結果に関する情報を表示する。

例：

```text
Processing Complete
Color Palette
Strength
Image Format
```

---

# 49. DownloadButton

Processed ImageをDownloadする。

基本Flow：

```text
DownloadButton
 ↓
API Client
 ↓
GET /api/images/{imageId}/download
```

---

# 50. BackToEditorButton

Result PageからEditorへ戻る。

React Routerを使用する。

---

# 51. Settings Components

Settings関連：

```text
AppearanceSettings
ThemeSelector
ProcessingSettings
AboutSettings
```

---

# 52. AppearanceSettings

UI Appearanceに関するSettings。

例：

```text
Theme
Animation
```

---

# 53. ThemeSelector

Themeを変更するUI。

将来的に、

```text
Dark
Light
System
```

などを利用できる。

---

# 54. Feedback Components

Feedback関連：

```text
LoadingIndicator
ErrorMessage
ErrorPanel
Toast
EmptyState
```

---

# 55. LoadingIndicator

Loading状態を表示する。

用途：

- Image Upload
- Processing
- Result Loading

---

# 56. ErrorMessage

Inline Errorを表示する。

例：

```text
画像サイズが大きすぎます。
```

---

# 57. ErrorPanel

PageまたはSection単位のErrorを表示する。

例：

```text
画像の処理に失敗しました。

[もう一度試す]
```

---

# 58. Toast

一時的なFeedbackを表示する。

例：

```text
画像を削除しました。
```

ただし、重要なErrorをToastだけで伝えない。

---

# 59. EmptyState

Dataが存在しない場合に表示する。

例：

```text
まだ画像がアップロードされていません。
```

---

# 60. Navigation Components

Navigation関連：

```text
Header
Navigation
NavLink
BackButton
```

---

# 61. Navigation

React Routerを利用する。

基本Route：

```text
/
 /editor
 /result
 /settings
```

---

# 62. Link

NavigationにはReact RouterのLinkを利用する。

通常のPage遷移で不要なFull Page Reloadを発生させない。

---

# 63. Button

Buttonは用途によってVariantを分ける。

例：

```text
Primary
Secondary
Ghost
Danger
```

---

# 64. Primary Button

主要Actionに使用する。

例：

```text
画像をアップロード
カラーリングを実行
ダウンロード
```

---

# 65. Secondary Button

補助Actionに使用する。

例：

```text
戻る
キャンセル
```

---

# 66. Danger Button

削除などの破壊的Actionに使用する。

例：

```text
画像を削除
```

---

# 67. Icon Button

IconのみのButton。

必ずAccessibility Labelを設定する。

例：

```text
aria-label="画像を削除"
```

---

# 68. Form Components

Form関連：

```text
Form
FormField
Label
Input
Select
Slider
ColorInput
```

---

# 69. Form Field

Form Fieldは、

```text
Label
Input
Error
Description
```

の組み合わせを基本とする。

---

# 70. Form Validation

Frontend Form ValidationはUX改善のために実装する。

Backend Validationを代替するものではない。

---

# 71. APIとComponent

Componentから直接APIへアクセスしない。

悪い例：

```tsx
function ProcessingButton() {
  fetch("/api/images/...");
}
```

良い例：

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

# 72. Custom Hooks

APIや複雑なStateをCustom Hookへ分離する。

例：

```text
useImageUpload
useImageProcessing
usePalette
useResult
```

---

# 73. useImageUpload

責務：

- File選択
- Upload
- Upload State
- Upload Error
- Image ID取得

概念：

```text
idle
uploading
success
error
```

---

# 74. useImageProcessing

責務：

- Processing Request
- Processing State
- Processing Error
- Result取得

---

# 75. usePalette

責務：

- Palette State
- Color追加
- Color削除
- Color変更
- Ratio変更
- Palette Validation

---

# 76. useResult

責務：

- Result State
- Result取得
- Result Error
- Result Loading

---

# 77. API Client

API Clientは、

```text
src/api/
```

などで管理する。

例：

```text
imageApi.ts
processingApi.ts
```

---

# 78. API Client Responsibilities

API Clientでは、

- HTTP Request
- Header
- Request Body
- Response Parse
- Error Parse

を担当する。

---

# 79. Component Data Flow

Editorでは、

```text
EditorPage
 ↓
useImageUpload
 ↓
ImageUploader
```

```text
EditorPage
 ↓
usePalette
 ↓
PaletteEditor
```

```text
EditorPage
 ↓
useImageProcessing
 ↓
ProcessingButton
```

という構造を基本とする。

---

# 80. Editor Data Flow

```text
User
 ↓
ImageUploader
 ↓
useImageUpload
 ↓
API Client
 ↓
POST /api/images
 ↓
FastAPI
 ↓
imageId
 ↓
EditorPage State
```

---

# 81. Processing Data Flow

```text
User
 ↓
ProcessingButton
 ↓
useImageProcessing
 ↓
API Client
 ↓
POST /api/images/{imageId}/process
 ↓
FastAPI
 ↓
Image Processing
 ↓
Color Matching
 ↓
Result
```

---

# 82. Result Data Flow

```text
FastAPI
 ↓
Result
 ↓
useResult
 ↓
ResultPage
 ↓
ImageComparison
```

---

# 83. Props設計

Component間のData受け渡しはPropsを基本とする。

例：

```ts
type ImagePreviewProps = {
  src: string;
  alt: string;
};
```

---

# 84. Propsの原則

Propsは、

- 必要最小限
- 明確な型
- 意味のある名前

とする。

---

# 85. Props Drilling

Props Drillingが過剰になった場合はCustom HookやContextなどを検討する。

ただし、最初からGlobal Stateを導入しない。

---

# 86. Context

Application全体で共有する必要があるStateのみContextを検討する。

候補：

```text
Theme
Application Settings
```

---

# 87. Global State

MVPではGlobal State Management Libraryを必須としない。

React StateとCustom Hookを基本とする。

---

# 88. Image State

Editorでは以下を管理する。

```text
selectedFile
imageId
previewUrl
uploadStatus
```

---

# 89. Palette State

```text
palette
selectedColor
ratio
strength
```

など。

---

# 90. Processing State

```text
processingStatus
processingError
result
```

など。

---

# 91. Component State Responsibility

Stateは最も近い適切なOwner Componentで管理する。

例えばPalette Stateは、

```text
EditorPage
```

または、

```text
usePalette
```

で管理する。

---

# 92. Derived State

既存Stateから計算できる値を別Stateとして重複保存しない。

例：

```text
totalRatio
```

はPaletteから計算できる場合、別Stateとして保持しない。

---

# 93. Component Composition

巨大なComponentを作らずCompositionを利用する。

悪い例：

```text
Editor.tsx
↓
1000行以上
```

良い例：

```text
EditorPage
├── ImageUploader
├── ImagePreview
├── PaletteEditor
├── StrengthSlider
└── ProcessingButton
```

---

# 94. Component Size

Componentの行数だけを機械的な基準にしない。

ただし、

- UI
- State
- API
- Validation
- Animation

が一つのComponentへ集中している場合は分割を検討する。

---

# 95. Component Reusability

以下はReusable Componentとして設計する。

```text
Button
Input
Slider
Card
Modal
Toast
LoadingIndicator
ErrorMessage
```

---

# 96. Feature Specific Component

以下はColorFit固有のFeature Component。

```text
PaletteEditor
ImageComparison
ProcessingButton
ImageUploader
```

他Projectへの再利用性より、ColorFit内での責務の明確さを優先する。

---

# 97. UI ComponentとFeature Component

UI Component：

```text
Button
Input
Slider
Card
```

Feature Component：

```text
ImageUploader
PaletteEditor
ImageComparison
ProcessingPanel
```

Feature ComponentはUI Componentを組み合わせて作る。

---

# 98. Component Dependency

基本：

```text
Page
 ↓
Feature
 ↓
UI
```

Feature ComponentがPageへ依存しないようにする。

---

# 99. Circular Dependency

Component間のCircular Dependencyを作らない。

例：

```text
A
 ↓
B
 ↓
A
```

のような構造を避ける。

---

# 100. Component Import

可能な限り明確なImport構造を維持する。

---

# 101. Accessibility

すべてのInteractive ComponentでAccessibilityを考慮する。

対象：

```text
Button
Input
ColorPicker
Slider
Dialog
Navigation
```

---

# 102. Image Accessibility

Imageには適切な`alt`を設定する。

例：

```tsx
<img src={src} alt="カラーリング前のWebデザイン" />
```

Decorative Imageの場合は適切に扱う。

---

# 103. Keyboard Navigation

以下はKeyboard操作可能にする。

```text
Button
Link
Input
Slider
Dialog
```

---

# 104. Focus

Keyboard操作時にFocus状態を視認できるようにする。

---

# 105. Form Label

InputにはLabelを関連付ける。

---

# 106. Error Accessibility

Form ErrorはScreen Readerでも認識できるようにする。

必要に応じて、

```text
aria-describedby
aria-invalid
```

などを使用する。

---

# 107. Responsive Component

すべての主要ComponentをResponsive Designに対応させる。

対象：

```text
Desktop
Tablet
Mobile
```

---

# 108. Editor Responsive

Desktop：

```text
┌────────────────────────────┐
│ Image        │ Settings    │
│ Preview      │ Palette     │
│              │ Ratio       │
│              │ Strength    │
└────────────────────────────┘
```

Mobile：

```text
┌──────────────────┐
│ Image Preview     │
├──────────────────┤
│ Palette           │
├──────────────────┤
│ Ratio             │
├──────────────────┤
│ Strength          │
├──────────────────┤
│ Process Button    │
└──────────────────┘
```

---

# 109. Result Responsive

Desktop：

```text
┌──────────────────────────┐
│ Original │ Processed     │
└──────────────────────────┘
```

Mobile：

```text
┌──────────────────┐
│ Original          │
├──────────────────┤
│ Processed         │
└──────────────────┘
```

---

# 110. Responsive Breakpoint

Tailwind CSSのBreakpointを基本とする。

具体的なBreakpointは、

`08_ui_guideline.md`

に従う。

---

# 111. Animation

ColorFitでは近未来的なUI体験を実現するため、Animationを使用する。

主な用途：

```text
Page Transition
Hover
Button
Upload
Processing
Result
Modal
Navigation
```

---

# 112. Animation原則

AnimationはDecorationだけを目的としない。

以下を目的とする。

- State Changeの伝達
- User Feedback
- Navigation
- Visual Hierarchy
- Application Identity

---

# 113. GSAP

AnimationではGSAPを使用できる。

主な用途：

```text
Hero Animation
Page Transition
Image Reveal
Processing Animation
Background Animation
```

---

# 114. GSAP使用ルール

GSAP AnimationはComponentのLifecycleと整合させる。

Component Unmount時にはAnimationやEvent ListenerをCleanupする。

---

# 115. CSS Animation

単純なAnimationではCSS / Tailwind CSSを優先する。

例：

```text
Hover
Fade
Scale
Transition
```

複雑なAnimationのみGSAPを利用する。

---

# 116. Reduced Motion

ユーザーがReduced Motionを設定している場合、Animationを減らす。

```css
@media (prefers-reduced-motion: reduce) {
  ...
}
```

---

# 117. Loading Animation

Loading中はAnimationを利用してもよい。

ただしAnimationが長すぎて操作を妨げないようにする。

---

# 118. Error Animation

Error表示Animationは短くする。

過剰なShake Animationなどを多用しない。

---

# 119. Component Testing

主要ComponentにはTestを作成する。

対象：

```text
ImageUploader
PaletteEditor
ColorPicker
RatioEditor
ProcessingButton
ImageComparison
DownloadButton
```

---

# 120. Component Test

Component Testでは、

- Rendering
- User Interaction
- Validation
- State Change
- Error State
- Loading State

などを確認する。

---

# 121. ImageUploader Test

- [ ] Fileを選択できる
- [ ] Drag & Dropできる
- [ ] Supported Formatを受け入れる
- [ ] Unsupported Formatを拒否する
- [ ] File Size Errorを表示する
- [ ] Upload中Stateを表示する
- [ ] Upload Errorを表示する

---

# 122. PaletteEditor Test

- [ ] Colorを追加できる
- [ ] Colorを削除できる
- [ ] Colorを変更できる
- [ ] Ratioを変更できる
- [ ] Ratio合計を表示できる
- [ ] Invalid Colorを拒否する
- [ ] Invalid Ratioを拒否する

---

# 123. ProcessingButton Test

- [ ] Ready State
- [ ] Disabled State
- [ ] Processing State
- [ ] Success State
- [ ] Error State
- [ ] Processing APIが呼ばれる

---

# 124. ImageComparison Test

- [ ] Original Image表示
- [ ] Processed Image表示
- [ ] Responsive表示
- [ ] Loading State
- [ ] Error State

---

# 125. DownloadButton Test

- [ ] Download操作
- [ ] Loading State
- [ ] Download Error
- [ ] Disabled State

---

# 126. Component Integration Test

Feature単位でComponentを組み合わせたTestも実施する。

例：

```text
EditorPage
 ↓
ImageUploader
 ↓
PaletteEditor
 ↓
ProcessingButton
```

---

# 127. Editor Integration Test

主要Flow：

```text
Upload Image
 ↓
Set Palette
 ↓
Set Ratio
 ↓
Set Strength
 ↓
Process
 ↓
Result
```

が正常に動作することを確認する。

---

# 128. Result Integration Test

```text
Result Page
 ↓
Original Image
 ↓
Processed Image
 ↓
Download
```

が正常に動作することを確認する。

---

# 129. Component Error Boundary

Application全体のUnexpected Errorに備えてError Boundaryを検討する。

---

# 130. Error Boundary

Error Boundaryは、

```text
Unexpected React Error
 ↓
Fallback UI
```

を提供する。

---

# 131. Error BoundaryとAPI Error

API Errorは通常のError Stateとして扱う。

Error Boundaryは予期しないReact Rendering Errorを対象とする。

---

# 132. Component Security

Componentへ渡されるUser Inputを安全に扱う。

特に、

```text
Filename
Color
Image URL
Error Message
```

など。

---

# 133. dangerouslySetInnerHTML

原則として使用しない。

必要な場合はSecurity Reviewを行う。

---

# 134. Image URL

User-generated Image URLを表示する場合、Backendが生成した安全なURLを利用する。

---

# 135. Component Performance

不要なRe-renderを避ける。

ただし、初期段階から過剰なMemoizationを行わない。

---

# 136. React.memo

Rendering Performance上の問題が確認されたComponentに対して利用を検討する。

---

# 137. useMemo / useCallback

必要性が明確な場合のみ利用する。

「とりあえず全部memo化」は行わない。

---

# 138. Image Performance

画像表示では、

- 適切なFormat
- 適切なSize
- Lazy Loading
- Responsive Image

などを検討する。

---

# 139. Large Image

巨大画像をFrontendへそのまま表示し続けない。

必要に応じてThumbnailを利用する。

---

# 140. Component Documentation

複雑なComponentにはUsage Exampleを記述する。

例：

```tsx
<ImageUploader onUpload={handleUpload} disabled={isProcessing} />
```

---

# 141. Component Props Documentation

Propsには意味が分かる型名を使用する。

例：

```ts
type ProcessingButtonProps = {
  disabled: boolean;
  loading: boolean;
  onProcess: () => void;
};
```

---

# 142. Component API

Component自身のAPIを明確にする。

Component APIとは、

```text
Props
Events
State
Slots / Children
```

などを指す。

---

# 143. Children

Layout Componentでは`children`を利用してCompositionする。

例：

```tsx
<AppLayout>
  <EditorPage />
</AppLayout>
```

---

# 144. Controlled Component

Form Componentでは必要に応じてControlled Componentとして設計する。

例：

```tsx
<ColorInput value={color} onChange={setColor} />
```

---

# 145. Uncontrolled Component

単純なUIではUncontrolled Componentも利用できる。

ただし、Application Stateと連動するFormではControlled Componentを基本とする。

---

# 146. Component Events

Event Handlerは、

```text
onChange
onSubmit
onClick
onRemove
onUpload
onProcess
```

など意味の明確な名前を使用する。

---

# 147. Component Event Responsibility

ComponentはEventを受け取り、必要なCallbackを実行する。

Business LogicをEvent Handlerへ大量に書かない。

---

# 148. Component Dependency Rules

基本的なDependency：

```text
Pages
 ↓
Features
 ↓
UI
```

避ける：

```text
UI
 ↓
Page
```

---

# 149. Component Import Rules

共通UI ComponentからFeature Componentへ依存しない。

例：

```text
ui/Button
```

が、

```text
editor/PaletteEditor
```

をImportする構造は禁止する。

---

# 150. Feature Dependency

Feature間の依存は必要最小限にする。

例えば、

```text
editor
 ↓
result
```

のような依存を作るのではなく、共通DataをPageまたはHookで管理する。

---

# 151. Component Directory Example

最終的な構成例：

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Slider.tsx
│   │   ├── Card.tsx
│   │   └── Dialog.tsx
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── image/
│   │   ├── ImageUploader.tsx
│   │   ├── ImagePreview.tsx
│   │   ├── OriginalImage.tsx
│   │   ├── ProcessedImage.tsx
│   │   └── ImageComparison.tsx
│   │
│   ├── color/
│   │   ├── PaletteEditor.tsx
│   │   ├── PaletteColorItem.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── ColorInput.tsx
│   │   ├── RatioEditor.tsx
│   │   └── StrengthSlider.tsx
│   │
│   ├── editor/
│   │   ├── EditorLayout.tsx
│   │   ├── ImageEditorPanel.tsx
│   │   ├── ColorSettingsPanel.tsx
│   │   └── ProcessingPanel.tsx
│   │
│   ├── result/
│   │   ├── ResultHero.tsx
│   │   ├── ResultInfo.tsx
│   │   ├── DownloadButton.tsx
│   │   └── BackToEditorButton.tsx
│   │
│   ├── settings/
│   │   ├── AppearanceSettings.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── AboutSettings.tsx
│   │
│   └── feedback/
│       ├── LoadingIndicator.tsx
│       ├── ErrorMessage.tsx
│       ├── ErrorPanel.tsx
│       ├── Toast.tsx
│       └── EmptyState.tsx
│
├── hooks/
│   ├── useImageUpload.ts
│   ├── useImageProcessing.ts
│   ├── usePalette.ts
│   └── useResult.ts
│
├── api/
│   ├── imageApi.ts
│   └── processingApi.ts
│
└── pages/
    ├── HomePage.tsx
    ├── EditorPage.tsx
    ├── ResultPage.tsx
    └── SettingsPage.tsx
```

---

# 152. Component責務一覧

| Component           | 主な責務                |
| ------------------- | ----------------------- |
| HomePage            | Home画面Composition     |
| EditorPage          | Editor画面Composition   |
| ResultPage          | Result画面Composition   |
| SettingsPage        | Settings画面Composition |
| AppLayout           | Application Layout      |
| Header              | Header / Navigation     |
| Footer              | Footer                  |
| ImageUploader       | Image選択 / Upload UI   |
| ImagePreview        | Image Preview           |
| ImageComparison     | Before / After比較      |
| PaletteEditor       | Palette管理             |
| PaletteColorItem    | Color単位の編集         |
| ColorPicker         | Color選択               |
| ColorInput          | HEX入力                 |
| RatioEditor         | Ratio編集               |
| StrengthSlider      | Strength編集            |
| ProcessingButton    | Processing開始          |
| ProcessingIndicator | Processing表示          |
| ResultInfo          | Result情報              |
| DownloadButton      | Download                |
| ErrorMessage        | Error表示               |
| ErrorPanel          | Section Error           |
| LoadingIndicator    | Loading表示             |
| Toast               | 一時Feedback            |
| EmptyState          | Empty状態               |

---

# 153. PageとComponentの対応

## Home

```text
HomePage
├── Header
├── HeroSection
├── FeatureSection
├── CTASection
└── Footer
```

---

## Editor

```text
EditorPage
├── Header
├── EditorLayout
│   ├── ImageEditorPanel
│   │   ├── ImageUploader
│   │   └── ImagePreview
│   │
│   └── ColorSettingsPanel
│       ├── PaletteEditor
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

## Result

```text
ResultPage
├── Header
├── ResultHero
├── ImageComparison
├── ResultInfo
├── DownloadButton
├── BackToEditorButton
└── Footer
```

---

## Settings

```text
SettingsPage
├── Header
├── SettingsLayout
│   ├── AppearanceSettings
│   │   └── ThemeSelector
│   ├── ProcessingSettings
│   └── AboutSettings
└── Footer
```

---

# 154. UI Referenceとの対応

UI Referenceで作成した画面をComponent設計のVisual Referenceとして利用する。

```text
docs/ui-reference/
├── 01-home
├── 02-editor
├── 03-result
└── 04-settings
```

UI実装時には、UI Referenceの以下を確認する。

- Layout
- Spacing
- Typography
- Color
- Animation
- Responsive Design
- Component配置

---

# 155. UI Referenceと実装の関係

UI ReferenceはVisual Designの基準とする。

Component実装では、

```text
UI Reference
 ↓
Component Design
 ↓
React Component
```

の順で実装する。

---

# 156. Component DesignとUI Guideline

Component Designでは、

```text
「何をComponentとして作るか」
```

を定義する。

UI Guidelineでは、

```text
「そのComponentをどう見せるか」
```

を定義する。

---

# 157. Component DesignとArchitecture

Architecture：

```text
Frontend
Backend
Storage
```

Component Design：

```text
Frontend
 ↓
Page
 ↓
Feature
 ↓
UI
```

という関係になる。

---

# 158. Component DesignとAPI

APIとの接続は、

```text
Component
 ↓
Hook
 ↓
API Client
 ↓
FastAPI
```

とする。

---

# 159. Component DesignとImage Processing

Image ProcessingはFrontend Componentでは実装しない。

```text
Frontend
 ↓
ProcessingButton
 ↓
useImageProcessing
 ↓
API
 ↓
FastAPI
 ↓
Python Image Processing
```

---

# 160. Component DesignとColor Matching

Color Matching AlgorithmはBackend側で実装する。

Frontendでは、

```text
Palette
Ratio
Strength
```

を入力するUIを提供する。

---

# 161. Component DesignとStorage

Frontend ComponentからR2へ直接アクセスしない。

```text
DownloadButton
 ↓
API Client
 ↓
FastAPI
 ↓
Storage Service
 ↓
R2
```

---

# 162. Loading Stateの統一

Loading UIはApplication全体で統一する。

対象：

```text
Upload
Processing
Result
Download
```

---

# 163. Error Stateの統一

Error UIもApplication全体で統一する。

対象：

```text
Upload Error
Processing Error
Result Error
Download Error
```

---

# 164. Disabled State

Interactive ComponentにはDisabled Stateを用意する。

対象：

```text
Button
Input
Slider
ColorPicker
```

---

# 165. Empty State

Image未Upload時などにEmpty Stateを表示する。

例：

```text
画像をアップロードしてください。
```

---

# 166. Hover State

DesktopではInteractive ElementにHover Stateを設定する。

---

# 167. Focus State

Keyboard操作時にはFocus Stateを表示する。

---

# 168. Active State

ButtonやNavigation ItemにはActive Stateを設定する。

---

# 169. Responsive State

ComponentはScreen Sizeに応じてLayoutを変更できるようにする。

---

# 170. Mobile Navigation

MobileではHeader Navigationを必要に応じてMenuへ切り替える。

---

# 171. Touch Interaction

Mobileでは、

- Touch Target
- Slider
- Color Picker
- Image Comparison

などをTouch操作しやすくする。

---

# 172. Component Performance

特に以下のComponentではPerformanceを意識する。

```text
ImagePreview
ImageComparison
ColorPicker
PaletteEditor
ProcessingIndicator
```

---

# 173. Large Image Preview

Large ImageをPreviewする場合、FrontendのMemory使用量に注意する。

---

# 174. Object URL

Local Image PreviewでObject URLを使用する場合、不要になったURLをCleanupする。

概念：

```text
URL.createObjectURL()
 ↓
Preview
 ↓
URL.revokeObjectURL()
```

---

# 175. Component Lifecycle

Component Mount / Update / Unmountを考慮する。

特に、

```text
GSAP
Event Listener
Object URL
Timers
Subscriptions
```

などはCleanupする。

---

# 176. GSAP Cleanup

GSAP Animationを使用した場合、Component Unmount時にAnimationをCleanupする。

---

# 177. Event Listener Cleanup

Window / DocumentなどへEvent Listenerを登録した場合、Unmount時に解除する。

---

# 178. Timer Cleanup

`setTimeout` / `setInterval`を使用する場合、Unmount時にCleanupする。

---

# 179. Component Security

Componentで以下を行わない。

- Secretを保持する
- API Tokenを直接埋め込む
- R2 Secretを保持する
- Backend SecretをClient Bundleへ含める

---

# 180. Environment Variable

Frontend Environment VariableにはPublic情報のみを保存する。

例：

```text
API Base URL
```

SecretをFrontend Environment Variableへ保存しない。

---

# 181. Component Test Strategy

Testは以下のLayerで行う。

```text
Unit Test
 ↓
Component Test
 ↓
Integration Test
 ↓
E2E Test
```

---

# 182. Unit Test

Utility / Hookなどを対象とする。

---

# 183. Component Test

UI Component / Feature Componentを対象とする。

---

# 184. Integration Test

PageとComponentの連携を確認する。

---

# 185. E2E Test

実際のUser Flowを確認する。

例：

```text
Home
 ↓
Editor
 ↓
Upload
 ↓
Palette
 ↓
Process
 ↓
Result
 ↓
Download
```

---

# 186. Component Review Checklist

Component追加時：

- [ ] 責務が明確か
- [ ] 既存Componentで代用できないか
- [ ] Propsが適切か
- [ ] Stateが適切か
- [ ] API処理が分離されているか
- [ ] Accessibility対応されているか
- [ ] Responsive対応されているか
- [ ] Loading Stateが必要か
- [ ] Error Stateが必要か
- [ ] Disabled Stateが必要か
- [ ] Animationが必要か
- [ ] Testが必要か

---

# 187. Component追加判断

以下の場合Component化を検討する。

```text
再利用する
```

または、

```text
責務が明確に分離できる
```

または、

```text
State / Logicが独立している
```

---

# 188. Component分割しないケース

単純なStatic Markupだけを過剰にComponent化しない。

例：

```text
<div>
  <h2>タイトル</h2>
</div>
```

だけのComponentを無意味に作らない。

---

# 189. Component Reuseの優先順位

以下の順で判断する。

```text
1. 既存UI Component
2. 既存Feature Component
3. 新規Component
```

---

# 190. Design System

ColorFitでは共通UIを徐々にDesign System化する。

対象：

```text
Button
Input
Card
Badge
Dialog
Slider
Color Input
```

---

# 191. Design Token

UI Guidelineで定義したDesign TokenをComponentで利用する。

例：

```text
Color
Spacing
Radius
Shadow
Typography
Animation
```

---

# 192. Hard Coding

Component内に大量のDesign ValueをHard Codingしない。

Tailwind CSSのDesign TokenやCSS Variableなどを利用する。

---

# 193. Color Token

ColorはUI GuidelineのColor Tokenを利用する。

---

# 194. Spacing Token

Spacingも共通Ruleを使用する。

---

# 195. Typography Token

Typographyも共通Ruleを使用する。

---

# 196. Animation Token

Animation Duration / Easingなども共通化する。

---

# 197. Component Visual Consistency

同じ用途のComponentは同じVisual Ruleを使用する。

例：

```text
Primary Button
```

がPageごとに異なるDesignにならないようにする。

---

# 198. Component State Matrix

主要Componentでは以下のStateを考慮する。

| Component        | Default | Hover | Focus | Disabled | Loading | Error |
| ---------------- | ------- | ----- | ----- | -------- | ------- | ----- |
| Button           | ○       | ○     | ○     | ○        | ○       | -     |
| Input            | ○       | ○     | ○     | ○        | -       | ○     |
| Slider           | ○       | ○     | ○     | ○        | -       | ○     |
| ImageUploader    | ○       | ○     | ○     | ○        | ○       | ○     |
| ProcessingButton | ○       | ○     | ○     | ○        | ○       | ○     |
| DownloadButton   | ○       | ○     | ○     | ○        | ○       | ○     |

---

# 199. Component State Principle

ユーザーが現在の状態を視覚的に理解できることを重視する。

特に、

```text
Uploading
Processing
Completed
Error
```

を明確に区別する。

---

# 200. Component Design Principles

ColorFitでは以下を原則とする。

1. PageはCompositionを担当する。
2. Feature ComponentはColorFit固有機能を担当する。
3. UI ComponentはReusable UIを担当する。
4. Business LogicをUI Componentへ書かない。
5. API通信をUI Componentへ直接書かない。
6. API通信はHook / API Clientへ分離する。
7. Image ProcessingはBackendで行う。
8. Color MatchingはBackendで行う。
9. R2へFrontendから直接アクセスしない。
10. Component Stateは必要最小限にする。
11. Global Stateを過剰に使用しない。
12. Responsive Designを前提とする。
13. Accessibilityを考慮する。
14. Animationは目的を持って使用する。
15. GSAPはCleanupを行う。
16. Componentを過剰分割しない。
17. UI ReferenceをVisual Referenceとして利用する。
18. UI GuidelineのDesign Tokenを利用する。
19. Error / Loading / Disabled Stateを統一する。
20. Test可能なComponentを設計する。

---

# 201. 禁止事項

以下を原則として禁止する。

### Architecture

- UI ComponentからAPIを直接呼び出す
- UI ComponentからR2へ直接アクセスする
- Page Componentへ大量のBusiness Logicを書く
- Component間でCircular Dependencyを作る

### Security

- SecretをFrontendへ埋め込む
- R2 SecretをClientへ公開する
- API TokenをComponentへHard Codingする

### State

- 不要なGlobal Stateを導入する
- Derived Stateを重複管理する

### UI

- Pageごとに同じUIを別実装する
- Design Tokenを無視して個別の色やSpacingを乱立させる
- Accessibilityを無視する

### Animation

- 不要なAnimationを大量に使用する
- Component Unmount後もAnimationを実行し続ける
- Reduced Motionを無視する

---

# 202. 完了条件

Component設計は以下を満たすことを完了条件とする。

- [ ] Component設計方針が定義されている
- [ ] Page Componentが定義されている
- [ ] Layout Componentが定義されている
- [ ] Feature Componentが定義されている
- [ ] UI Componentが定義されている
- [ ] Image Componentが定義されている
- [ ] Color Componentが定義されている
- [ ] Processing Componentが定義されている
- [ ] Result Componentが定義されている
- [ ] Settings Componentが定義されている
- [ ] Feedback Componentが定義されている
- [ ] Navigation Componentが定義されている
- [ ] Custom Hookが定義されている
- [ ] API Clientとの関係が定義されている
- [ ] Component Data Flowが定義されている
- [ ] Props設計方針が定義されている
- [ ] State管理方針が定義されている
- [ ] Responsive Design方針が定義されている
- [ ] Accessibility方針が定義されている
- [ ] Animation方針が定義されている
- [ ] GSAP利用方針が定義されている
- [ ] Component Testing方針が定義されている
- [ ] Component Directory構成が定義されている
- [ ] UI Referenceとの関係が定義されている
- [ ] UI Guidelineとの関係が定義されている
- [ ] APIとの関係が定義されている
- [ ] Image Processingとの関係が定義されている
- [ ] Storageとの関係が定義されている
- [ ] Security方針が定義されている
- [ ] Performance方針が定義されている
