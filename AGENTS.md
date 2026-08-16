# ColorFit - AI Agent Development Guidelines

## 1. プロジェクト概要

ColorFitは、Webデザイナーを対象としたWebアプリケーションである。

ユーザーが制作しているWebデザインの画像、配色、配色比率などを入力すると、そのWebデザインに適した色合いへ画像を加工することを目的とする。

ColorFitのCore User Flowは以下とする。

```text
Webデザイン画像をUpload
        ↓
Color Paletteを入力
        ↓
Color Ratioを設定
        ↓
適用Strengthを設定
        ↓
Color Matching
        ↓
Image Processing
        ↓
Result確認
        ↓
Processed ImageをDownload
```

---

# 2. AI Agentの基本方針

AI AgentはColorFitの開発において、以下の原則を必ず守ること。

1. 既存の設計を尊重すること。
2. 実装前に関連する設計書を確認すること。
3. 設計書に記載されている仕様を勝手に変更しないこと。
4. 必要以上にArchitectureを変更しないこと。
5. 不要なLibraryやFrameworkを追加しないこと。
6. 既存Componentを確認せずに新しいComponentを作成しないこと。
7. FrontendとBackendの責務を混在させないこと。
8. Securityを無視した実装を行わないこと。
9. Error Handlingを省略しないこと。
10. 可能な限りTestを追加すること。
11. 実装内容とDocumentationの整合性を維持すること。
12. 変更理由が重要な場合はDevelopment Logへ記録すること。

---

# 3. 設計書を正とする

ColorFitでは、`docs/` 配下の設計書をProject Specificationとして扱う。

特に以下のDocumentを参照すること。

```text
docs/
├── product.md
├── 01_requirements.md
├── 02_basic-design.md
├── 03_detail-design/
├── 04_architecture.md
├── 05_database.md
├── 06_api.md
├── 07_component_design.md
├── 08_ui_guideline.md
├── 10_deployment.md
├── screen-list.md
├── roadmap.md
└── development-log.md
```

---

# 4. Documentの役割

各Documentは以下の目的で使用する。

```text
product.md
    ↓
ColorFitとは何か

01_requirements.md
    ↓
何を作るのか

02_basic-design.md
    ↓
システムをどう設計するのか

03_detail-design/
    ↓
各機能をどう実装するのか

04_architecture.md
    ↓
システム全体をどう構成するのか

05_database.md
    ↓
データをどう管理するのか

06_api.md
    ↓
FrontendとBackendがどう通信するのか

07_component_design.md
    ↓
React Componentをどう設計するのか

08_ui_guideline.md
    ↓
UIをどのようなルールで作るのか

10_deployment.md
    ↓
本番へどう公開するのか

screen-list.md
    ↓
どの画面が存在するのか

roadmap.md
    ↓
どの順番で開発するのか

development-log.md
    ↓
実際に何を行ったのか
```

---

# 5. 実装前のDocument確認

新しいFeatureを実装する場合、関連するDocumentを確認してから実装する。

最低限、以下を確認する。

```text
Requirements
↓
Basic Design
↓
Detail Design
↓
Architecture
↓
API / Component Design
```

UIを変更する場合は、

```text
ui-reference/
08_ui_guideline.md
screen-list.md
```

も確認する。

---

# 6. 設計と実装が矛盾する場合

設計書と既存Codeが矛盾している場合、勝手に判断して大規模な変更を行わない。

まず以下を確認する。

1. 最新の設計書
2. 関連するDetail Design
3. Architecture
4. API Design
5. Component Design
6. Development Log

それでも判断できない場合は、変更前に確認すること。

---

# 7. 設計変更

実装上の理由で設計変更が必要になった場合、以下の順序で行う。

```text
問題を確認
    ↓
変更理由を整理
    ↓
影響範囲を確認
    ↓
関連Documentを更新
    ↓
実装
    ↓
Test
    ↓
Development Logへ記録
```

設計書を変更せずにCodeだけを変更してはならない。

---

# 8. Technology Stack

ColorFitの基本Technology Stackは以下とする。

## Frontend

```text
React
TypeScript
React Router
Tailwind CSS
GSAP
```

## Backend

```text
Python
FastAPI
```

## Image Processing

必要に応じて、

```text
Pillow
OpenCV
NumPy
```

などを使用する。

実際に必要かどうかを確認してから導入すること。

---

# 9. Frontendの責務

Frontendは主に以下を担当する。

```text
UI
User Interaction
Routing
Form
Validation UX
Image Preview
Loading UI
Error UI
Animation
Responsive Design
Accessibility
```

FrontendにBusiness LogicやImage Processing Logicを過剰に配置しない。

---

# 10. Backendの責務

Backendは主に以下を担当する。

```text
API
Business Logic
Validation
Image Processing
Color Matching
Storage Access
Security
Error Handling
```

---

# 11. Image Processingの責務

Image ProcessingはBackend側で実行する。

基本Flow：

```text
Frontend
    ↓
FastAPI
    ↓
Image Processing
    ↓
Color Matching
    ↓
Processed Image
    ↓
Storage
    ↓
Frontend
```

Frontendで本格的なImage Processingを実装しない。

---

# 12. Color Matchingの責務

Color Matching AlgorithmはBackend側で管理する。

Frontendは以下を入力する。

```text
Palette
Ratio
Strength
```

Backendは入力値をValidationしたうえでColor Matchingを実行する。

---

# 13. Storageの責務

Image StorageはBackendを中心に管理する。

基本構成：

```text
Frontend
    ↓
FastAPI
    ↓
Storage Service
    ↓
Object Storage
```

FrontendへStorage Secretを公開してはならない。

---

# 14. Routing

MVPの基本Routeは以下とする。

```text
/
/editor
/result
/settings
```

勝手に新しいRouteを追加しない。

新しい画面が必要になった場合は、

```text
screen-list.md
```

を更新してから実装する。

---

# 15. MVP画面

MVPでは以下の4画面を基本とする。

```text
SCR-001 Home
SCR-002 Editor
SCR-003 Result
SCR-004 Settings
```

対応するUI Reference：

```text
docs/ui-reference/
├── 01-home
├── 02-editor
├── 03-result
└── 04-settings
```

---

# 16. UI Reference

UI ReferenceはFrontend実装におけるVisual Referenceとして扱う。

特に以下を勝手に変更しない。

```text
Layout
Typography
Color
Spacing
Border
Radius
Glow
Animation
Responsive Layout
```

ただし、UI Referenceに存在しない実装上必要なStateについては、既存Design SystemとUI Guidelineに従って追加する。

---

# 17. Responsive Design

ColorFitはResponsive Designを必須とする。

対象：

```text
Mobile
Tablet
Desktop
Large Desktop
```

Desktopだけで正常に見える実装を完成としない。

---

# 18. Accessibility

UI実装ではAccessibilityを考慮する。

最低限、

```text
Keyboard Navigation
Focus
Color Contrast
Form Label
Error Message
Image Alt
Reduced Motion
```

を考慮する。

---

# 19. Animation

ColorFitは近未来的なVisual Designを採用する。

AnimationにはGSAPを使用できる。

ただし、Animationは単なる装飾として過剰に使用しない。

以下の目的を優先する。

```text
Feedback
Transition
Hierarchy
Interaction
Branding
```

---

# 20. Reduced Motion

Animationを無効化できる環境では、ユーザー体験を損なわない形でAnimationを軽減する。

---

# 21. Component設計

Componentは責務を明確にする。

基本構造：

```text
Page
 ↓
Feature Component
 ↓
UI Component
```

---

# 22. Page Component

Page Componentは画面全体のCompositionを担当する。

例：

```text
HomePage
EditorPage
ResultPage
SettingsPage
```

Page Componentに過剰なBusiness Logicを記述しない。

---

# 23. Feature Component

ColorFit固有の機能はFeature Componentとして分離する。

例：

```text
ImageUploader
PaletteEditor
RatioEditor
StrengthSlider
ProcessingButton
ImageComparison
DownloadButton
```

---

# 24. UI Component

汎用UIはReusable Componentとして実装する。

例：

```text
Button
Input
Slider
Card
Dialog
Badge
```

同じUIを複数箇所で使用する場合は、可能な限り再利用する。

---

# 25. State Management

MVPでは過剰なGlobal State Managementを導入しない。

基本的には、

```text
React State
Custom Hook
```

を使用する。

必要性が明確になるまでGlobal State Libraryを追加しない。

---

# 26. Custom Hook

複雑なStateやAPI LogicはCustom Hookへ分離する。

例：

```text
useImageUpload
useImageProcessing
usePalette
useResult
```

---

# 27. API設計

APIは`docs/06_api.md`を正とする。

基本的なAPI例：

```text
POST /api/images
POST /api/images/{imageId}/process
GET /api/images/{imageId}
GET /api/images/{imageId}/download
```

API Endpointを勝手に変更しない。

変更が必要な場合はAPI Designを更新する。

---

# 28. API Client

FrontendからBackend APIを呼び出す処理は、可能な限り専用のAPI Client Layerへ分離する。

Page Componentから直接大量のHTTP処理を記述しない。

---

# 29. Validation

Input ValidationはFrontendとBackendの両方で行う。

## Frontend

目的：

```text
User Experience
即時Feedback
```

## Backend

目的：

```text
Security
Data Integrity
Business Rule
```

Frontend Validationだけで安全と判断してはならない。

---

# 30. File Upload Security

Image Uploadでは以下を確認する。

```text
File Type
File Size
File Content
Filename
Path Traversal
Storage Access
```

拡張子だけを信頼しない。

---

# 31. Secret Management

以下の情報をFrontend Codeへ含めてはならない。

```text
API Secret
Storage Secret
Private Key
Database Credential
Backend Secret
```

SecretはEnvironment Variablesなど適切な方法で管理する。

---

# 32. Error Handling

Errorを握り潰さない。

最低限、

```text
Validation Error
Network Error
API Error
Upload Error
Processing Error
Storage Error
Unknown Error
```

を適切に扱う。

---

# 33. Error Message

Userへ表示するError Messageには、不要な内部情報を含めない。

以下を公開しない。

```text
Stack Trace
Database Error
Secret
Internal File Path
Internal Service Information
```

---

# 34. Loading State

非同期処理には適切なLoading Stateを用意する。

特に、

```text
Image Upload
Image Processing
Result Loading
Download
```

ではユーザーが処理中であることを理解できるUIを表示する。

---

# 35. Empty State

Dataが存在しない場合は適切なEmpty Stateを表示する。

Editorでは例えば、

```text
まだ画像がアップロードされていません。
```

などを表示する。

---

# 36. Testing

新しいFeatureを追加する場合、可能な範囲でTestを追加する。

基本的なTest Layer：

```text
Unit Test
Component Test
Integration Test
E2E Test
```

---

# 37. Test対象

特に以下をTestする。

```text
Validation
Color Matching
Image Processing
API
Image Upload
Download
Error Handling
```

---

# 38. Image Processing Test

Image Processingは通常のUI Testだけではなく、Python側のUnit Testを用意する。

少なくとも、

```text
正常なImage
異常なImage
Palette
Ratio
Strength
Output
```

を確認する。

---

# 39. Color Matching Test

Color Matching Algorithmの変更時には、既存Testが破壊されていないことを確認する。

Algorithmの変更によってOutputが変わる場合は、変更理由をDevelopment Logへ記録する。

---

# 40. Git

Git CommitはLogical Change単位で行う。

基本：

```text
1 Commit = 1 Logical Change
```

---

# 41. Commit Message

可能な限り意味の分かるCommit Messageを使用する。

例：

```text
feat: add image uploader
feat: add palette editor
feat: implement color matching
feat: add image processing
fix: handle invalid image upload
fix: correct result image layout
refactor: extract image processing service
test: add color matching tests
docs: update API design
```

---

# 42. 不要な変更

Feature実装中に関係のない既存Codeを大量に変更しない。

特に以下を避ける。

```text
不要なRename
不要なRefactor
不要なLibrary追加
不要なFile移動
不要なFormatting変更
```

---

# 43. Dependency追加

新しいDependencyを追加する前に、

1. 本当に必要か確認する。
2. 既存Dependencyで代替できないか確認する。
3. Bundle / Performanceへの影響を確認する。
4. Security / Maintenance状況を確認する。
5. 関連Documentを更新する。

---

# 44. Database

Database設計は、

```text
docs/05_database.md
```

を正とする。

Schema変更が必要な場合は、Database DesignとDevelopment Logを更新する。

---

# 45. Documentation

実装によって以下が変更された場合、関連Documentも更新する。

```text
Architecture
API
Database
Component
UI
Screen
Security
Testing
Roadmap
```

---

# 46. Development Log

実際の開発内容は、

```text
docs/development-log.md
```

へ記録する。

特に以下は記録する。

```text
重要な技術選定
Architecture変更
API変更
重大なBug
Security Issue
Performance改善
Design変更
Technical Debt
```

---

# 47. Roadmap

開発計画は、

```text
docs/roadmap.md
```

を正とする。

Roadmapから大きく外れるFeatureを勝手に追加しない。

---

# 48. Feature追加

新しいFeatureを追加する場合は、以下を確認する。

```text
Product価値
Requirements
MVP Scope
Architecture
API
UI
Testing
Security
```

MVPのCore User Flowを優先する。

---

# 49. Scope Creep

MVP開発中は、以下のような機能を理由なく追加しない。

```text
User Account
Social Login
Team Collaboration
Advanced Dashboard
Billing
Subscription
```

これらはCore User Flow完成後に検討する。

---

# 50. MVP優先順位

最優先は以下。

```text
Image Upload
 ↓
Color Palette
 ↓
Ratio
 ↓
Strength
 ↓
Color Matching
 ↓
Image Processing
 ↓
Result
 ↓
Download
```

---

# 51. P0 Feature

P0はCore Functionとする。

```text
Image Upload
Color Palette
Ratio
Strength
Color Matching
Image Processing
Result
Download
```

---

# 52. P1 Feature

P1はUI / UXなどの改善とする。

```text
Responsive
Animation
Loading
Error
Empty State
Accessibility
Visual Polish
```

---

# 53. P2 / P3 Feature

MVP後に検討する。

```text
History
Palette Preset
Saved Project
User Account
Sharing
Team Collaboration
```

---

# 54. 作業開始前の確認

Agentが新しいTaskを開始する前に、以下を確認する。

```text
1. Taskの目的
2. 関連Requirements
3. 関連Design
4. Architecture
5. 既存Code
6. 既存Component
7. 既存API
8. Test
9. UI Reference
```

---

# 55. 実装後の確認

実装後は以下を確認する。

```text
1. Type Error
2. Lint
3. Test
4. Build
5. Responsive
6. Accessibility
7. Error Handling
8. Security
9. UI Reference
10. Documentation
```

---

# 56. UI実装後の確認

UI Referenceが存在する画面では、実装結果と比較する。

対象：

```text
Home
Editor
Result
Settings
```

確認する項目：

```text
Layout
Spacing
Typography
Color
Border
Radius
Glow
Animation
Responsive
```

---

# 57. Build

Feature完成時には可能な限りProduction Buildを確認する。

Frontend / BackendのBuild方法は各Project Configurationに従う。

---

# 58. Console Error

完成したFeatureで不要なConsole Error / Warningを残さない。

意図的なWarningがある場合は理由を確認する。

---

# 59. Accessibility Warning

Accessibilityに関するWarningを理由なく無視しない。

---

# 60. Performance

特に以下に注意する。

```text
Large Image
Image Preview
Image Processing
Animation
Bundle Size
Memory Usage
API Response
```

---

# 61. Large Image

大きな画像を扱う場合は、

```text
File Size
Image Dimensions
Memory Usage
Processing Time
```

を考慮する。

---

# 62. Frontend / Backend分離

FrontendとBackendを1つの責務として扱わない。

基本：

```text
Frontend
UI / Interaction

Backend
API / Business Logic

Python
Image Processing
```

という責務分離を維持する。

---

# 63. Backend Python活用

ColorFitはPortfolioとしてPythonを使用したことを示すことも目的の一つとする。

そのため、Pythonを単にHealth Check用Backendとして使用するのではなく、Image Processing / Color Matchingなど、Pythonの強みを活かせる処理をBackendへ配置する。

---

# 64. Python Code品質

Python Codeでは、

```text
Type Hint
Clear Function Responsibility
Validation
Error Handling
Test
```

を意識する。

---

# 65. FastAPI Code品質

FastAPIでは、

```text
Router
Schema
Service
Configuration
```

などの責務を可能な限り分離する。

RouterへBusiness Logicを大量に記述しない。

---

# 66. Service Layer

Image ProcessingやColor MatchingなどのBusiness LogicはService Layerへ分離する。

概念：

```text
Router
 ↓
Service
 ↓
Image Processing
```

---

# 67. API Schema

Request / Response Schemaは明確に定義する。

曖昧なDictionaryを大量に渡す実装を避ける。

---

# 68. Logging

BackendではDebugに必要なLoggingを適切に行う。

ただし、

```text
Secret
Password
Token
Private Credential
```

などをLogへ出力してはならない。

---

# 69. Environment

Environmentごとに設定を分離する。

例：

```text
Development
Production
```

SecretをGit RepositoryへCommitしない。

---

# 70. CORS

Frontend / Backendを別OriginでDeployする場合、CORSを適切に設定する。

Development環境の設定をProductionへそのまま使用しない。

---

# 71. API Error Response

API Error ResponseはFrontendが扱いやすい形式にする。

内部Errorの詳細をそのままUserへ返さない。

---

# 72. File Naming

既存ProjectのNaming Conventionに従う。

新しいNaming Conventionを導入する前に既存Codeを確認する。

---

# 73. Folder Structure

既存のFolder Structureを尊重する。

新しいFolderを追加する場合は、既存構造と責務を確認する。

---

# 74. Code Duplication

同じ処理を複数箇所へコピーしない。

共通処理は適切なUtility / Hook / Serviceへ分離する。

ただし、過剰な抽象化は避ける。

---

# 75. Abstraction

将来使うかもしれないという理由だけで過剰なAbstractionを作らない。

現在のRequirementsに必要な範囲で実装する。

---

# 76. Refactoring

RefactoringはFeature実装と混ぜすぎない。

大規模Refactoringが必要な場合は、

```text
理由
影響範囲
メリット
デメリット
```

を確認してから実施する。

---

# 77. Breaking Change

既存API / Component / Data Structureを壊す変更には特に注意する。

影響範囲を確認する。

---

# 78. Backward Compatibility

既存Featureを壊さないことを基本とする。

変更によって既存Featureが動かなくなる場合は、意図と影響範囲を明確にする。

---

# 79. User Experience

Technical implementationだけでなく、Webデザイナーが実際に使いやすいかを考慮する。

特に、

```text
Upload
Palette Input
Ratio Input
Processing
Result
Download
```

の操作を分かりやすくする。

---

# 80. Core User Flowを優先

迷った場合はCore User Flowを優先する。

```text
Upload
 ↓
Color設定
 ↓
Processing
 ↓
Result
 ↓
Download
```

---

# 81. 禁止事項

以下を行ってはならない。

- 設計書を確認せずに大規模実装する。
- API仕様を勝手に変更する。
- Routeを勝手に変更する。
- UI Referenceを無視する。
- SecretをFrontendへ埋め込む。
- SecretをGitへCommitする。
- Backend Validationを省略する。
- Errorを握り潰す。
- Image ProcessingをFrontendへ無計画に移す。
- 不要なDependencyを追加する。
- 不要なGlobal Stateを導入する。
- 既存Componentを確認せずに重複Componentを作る。
- Testを理由なく削除する。
- 既存Featureを理由なく破壊する。
- 無関係なFileを大量に変更する。
- ユーザーの要求していないFeatureを勝手に追加する。

---

# 82. 判断に迷った場合

実装方法に迷った場合は、以下の優先順位で判断する。

```text
1. Requirements
2. Basic Design
3. Detail Design
4. Architecture
5. API Design
6. Component Design
7. UI Guideline
8. Existing Code
9. Simplicity
```

---

# 83. 設計書に記載がない場合

設計書に記載されていない事項については、既存Architecture / Coding Convention / UI Guidelineとの整合性を優先する。

複数の実装方法があり、将来のArchitectureへ影響する場合は、勝手に決めずに確認する。

---

# 84. Documentation First

新しいArchitecture / API / Component / Screenが必要な場合、可能な限り先にDocumentationを更新する。

```text
Documentation
 ↓
Implementation
 ↓
Test
```

を基本とする。

---

# 85. Documentation Synchronization

CodeとDocumentationが一致している状態を維持する。

Codeを変更した結果、Documentationが古くなった場合はDocumentationも更新する。

---

# 86. Phase管理

Developmentは`docs/roadmap.md`のPhaseに沿って進める。

Phaseを跨ぐ場合は、その理由を明確にする。

---

# 87. Development Log

重要なDecision / Problem / Solutionは、

```text
docs/development-log.md
```

へ記録する。

---

# 88. Phase完了条件

PhaseはCodeを書き終えただけでは完了としない。

基本：

```text
Implementation
 ↓
Test
 ↓
Review
 ↓
Documentation
 ↓
Phase Complete
```

---

# 89. Release

MVP Releaseでは、

```text
Upload
 ↓
Palette
 ↓
Ratio
 ↓
Strength
 ↓
Color Matching
 ↓
Image Processing
 ↓
Result
 ↓
Download
```

が正常に動作することを確認する。

---

# 90. MVP Scope

MVPでは以下を完成させる。

```text
Home
Editor
Result
Settings

Image Upload
Color Palette
Color Ratio
Strength
Color Matching
Image Processing
Download
```

---

# 91. Future Feature

以下はMVP完成後に検討する。

```text
History
Saved Palette
Palette Preset
Saved Project
User Account
Cloud Project
Sharing
Team Collaboration
```

---

# 92. AI Agentの最終原則

ColorFitの開発では、

```text
設計を理解する
    ↓
既存Codeを理解する
    ↓
最小限の変更を行う
    ↓
Testする
    ↓
結果を確認する
    ↓
Documentationを更新する
```

という流れを基本とする。

ColorFitの目的は、単にCodeを生成することではない。

**Webデザイナーが実際に利用できる品質のApplicationを、設計意図を維持しながら継続的に開発すること**を最優先とする。
