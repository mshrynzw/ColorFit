# ColorFit Frontend 詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitのFrontendに関する詳細設計を定義する。

`product.md`、`01_requirements.md`、`02_basic-design.md` で定義された要件および基本設計をもとに、React + TypeScriptを使用したFrontendの構成、ルーティング、状態管理、API通信、フォーム、バリデーション、エラー処理、画像処理UI、レスポンシブ対応などを定義する。

本書ではFrontendの実装方針を定義する。

個々のReactコンポーネントの責務やPropsについては、

`docs/07_component-design.md`

で定義する。

---

# 2. Frontend技術スタック

ColorFitのFrontendでは以下の技術を使用する。

| 分類       | 技術                  | 用途                         |
| ---------- | --------------------- | ---------------------------- |
| UI         | React                 | UI構築                       |
| 言語       | TypeScript            | 型安全な開発                 |
| Routing    | React Router          | ページ・画面遷移             |
| Build      | Vite                  | 開発・ビルド                 |
| Styling    | Tailwind CSS          | スタイリング                 |
| Animation  | GSAP                  | UIアニメーション             |
| Animation  | GSAP ScrollTrigger    | スクロール連動アニメーション |
| Validation | Zod                   | 入力値検証                   |
| Testing    | Vitest                | Unit Test                    |
| Testing    | React Testing Library | UI Test                      |
| E2E        | Playwright            | E2E Test                     |

具体的なライブラリのバージョンは、実装開始時点の安定版を採用する。

---

# 3. Frontendの責務

Frontendは以下を担当する。

- UI表示
- ユーザー入力
- フォーム操作
- カラー入力
- 配色比率入力
- 画像選択
- ドラッグ＆ドロップ
- 画像プレビュー
- Before / After操作
- 手動調整UI
- プリセット操作
- API通信
- 処理状態表示
- エラー表示
- 書き出し設定
- 設定画面
- レスポンシブUI
- アニメーション
- アクセシビリティ

Frontendは画像の本格的なカラー解析・カラー変換処理を担当しない。

画像処理の主要ロジックはBackendで実行する。

---

# 4. Frontendで担当しない処理

以下の処理はFrontendの責務としない。

- 本格的な画像解析
- 色マッチングアルゴリズム
- 高負荷な画像変換
- 画像の最終的なカラー処理
- 永続的な画像保存
- Storage管理
- Backend内部の処理
- データベースアクセス

FrontendはBackend APIを介してこれらの処理を利用する。

---

# 5. プロジェクト構成

Frontendはリポジトリ内の `frontend/` に配置する。

基本構成：

```text
frontend/
├── src/
│   ├── app/
│   ├── routes/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   └── main.tsx
│
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

実装時に必要に応じてディレクトリを追加する。

---

# 6. ディレクトリの責務

## 6.1 `app/`

アプリケーション全体の初期化や共通設定を配置する。

例：

```text
app/
├── App.tsx
├── providers/
└── router.tsx
```

---

## 6.2 `routes/`

React Routerによる画面単位のルートを配置する。

例：

```text
routes/
├── HomePage.tsx
├── EditorPage.tsx
├── ResultPage.tsx
└── SettingsPage.tsx
```

---

## 6.3 `features/`

ColorFit固有の機能単位でコードを分割する。

想定する機能：

```text
features/
├── palette/
├── image-upload/
├── image-analysis/
├── image-adjustment/
├── comparison/
├── export/
└── settings/
```

各Featureは、関連するUI、hooks、types、API処理などを必要に応じてまとめる。

---

## 6.4 `components/`

複数のFeatureから利用できる共通UIコンポーネントを配置する。

例：

```text
components/
├── ui/
├── layout/
└── feedback/
```

ColorFit固有の処理を持つコンポーネントは、原則として `features/` 側へ配置する。

---

## 6.5 `hooks/`

複数のFeatureで共有するCustom Hookを配置する。

例：

```text
hooks/
├── useMediaQuery.ts
├── useReducedMotion.ts
└── useDebounce.ts
```

Feature固有のHookは各Feature内に配置する。

---

## 6.6 `lib/`

外部ライブラリやAPI Clientなど、アプリケーション全体から利用する基盤処理を配置する。

例：

```text
lib/
├── api/
├── validation/
└── constants/
```

---

## 6.7 `types/`

アプリケーション全体で共有するTypeScript型を配置する。

---

## 6.8 `utils/`

汎用的な純粋関数などを配置する。

例：

```text
utils/
├── color.ts
├── file.ts
└── format.ts
```

---

# 7. ルーティング

React Routerを使用する。

MVPのルートは以下とする。

| Path        | 画面       | Route ID   |
| ----------- | ---------- | ---------- |
| `/`         | ホーム     | `home`     |
| `/editor`   | エディター | `editor`   |
| `/result`   | 結果       | `result`   |
| `/settings` | 設定       | `settings` |

基本構造：

```text
/
├── /editor
├── /result
└── /settings
```

---

# 8. ルーティング方針

## 8.1 `/`

ColorFitのホーム画面。

ユーザーがColorFitの概要を確認し、エディターへ移動する。

---

## 8.2 `/editor`

ColorFitのメイン画面。

以下の操作を行う。

- 配色設定
- 配色比率設定
- 画像アップロード
- 自動調整
- 手動調整
- Before / After比較

---

## 8.3 `/result`

調整結果画面。

以下を行う。

- 調整結果確認
- Before / After確認
- 使用配色確認
- 調整値確認
- 書き出し設定
- 画像書き出し

---

## 8.4 `/settings`

設定画面。

以下の設定を行う。

- 基本設定
- 外観
- 画像処理
- 書き出し
- アニメーション

---

# 9. Route Guard

MVPではユーザーアカウントを必須としないため、認証用Route Guardは実装しない。

ただし、将来的にユーザーアカウントを導入する場合は、Route Guardの追加を検討する。

---

# 10. Editorへのアクセス

MVPでは `/editor` に直接アクセスできるものとする。

ただし、画像が存在しない状態でも画面が破綻しないようにする。

例えば、

```text
画像未選択
↓
画像アップロードUIを表示
```

とする。

---

# 11. Resultへのアクセス

`/result` は調整結果を必要とする画面である。

結果データが存在しない場合は、

- `/editor` へ戻す
- または結果が存在しないことを表示する

などのフォールバックを行う。

MVPでは、ユーザーが迷わないことを優先し、適切なエラーメッセージとエディターへの導線を提供する。

---

# 12. 状態管理

ColorFitでは、状態を以下の3種類に分類する。

```text
UI状態
ドメイン状態
サーバー状態
```

---

## 12.1 UI状態

画面上の表示だけに関係する状態。

例：

- モーダル開閉
- メニュー開閉
- 選択中タブ
- Before / After表示状態
- アニメーション状態
- トースト表示
- ドラッグ中かどうか

基本的にコンポーネントローカルStateで管理する。

---

## 12.2 ドメイン状態

ColorFitの処理そのものに関係する状態。

例：

- Palette
- 配色比率
- Image
- Adjustment
- Preset
- Export設定

必要に応じてFeature単位で管理する。

---

## 12.3 サーバー状態

Backend APIとの通信によって取得・生成されるデータ。

例：

- アップロード結果
- 画像解析結果
- カラー調整結果
- 書き出し結果
- APIエラー

Server Stateの管理方法は実装時のAPI数と複雑性を考慮して決定する。

MVPでは、不要に大規模な状態管理ライブラリを導入しない。

---

# 13. Editorの状態

Editorでは以下の状態を扱う。

```text
EditorState
├── palette
├── paletteRatio
├── image
├── adjustment
├── preset
├── processingStatus
└── comparison
```

概念的には以下の構造とする。

```ts
type EditorState = {
  palette: Palette;
  paletteRatio: PaletteRatio;
  image: ImageState | null;
  adjustment: Adjustment;
  preset: Preset | null;
  processingStatus: ProcessingStatus;
  comparison: ComparisonState;
};
```

具体的な型定義は実装時に確定する。

---

# 14. Palette

配色情報は以下を基本とする。

```ts
type Palette = {
  primary: string;
  secondary: string;
  accent: string;
};
```

配色比率：

```ts
type PaletteRatio = {
  primary: number;
  secondary: number;
  accent: number;
};
```

---

# 15. カラー入力

カラー入力では以下を提供する。

- カラーピッカー
- HEX入力
- カラースウォッチ

HEX入力時は入力値を検証する。

有効なHEXカラー：

```text
#RRGGBB
```

を基本とする。

必要に応じて短縮形式などをサポートする。

---

# 16. カラー入力のバリデーション

以下の場合はエラーとする。

- 不正なHEX形式
- 空文字
- 不正な文字
- 想定外の値

エラー時には、入力欄の近くにユーザーが理解できるメッセージを表示する。

例：

```text
正しいカラーコードを入力してください。
```

---

# 17. 配色比率

配色比率は、

```text
primary
secondary
accent
```

の3つを扱う。

合計値は100%とする。

```text
primary + secondary + accent = 100
```

ユーザーが1つの値を変更した場合、残りの値をどのように調整するかはUXと実装の複雑性を考慮して決定する。

---

# 18. 画像アップロード

画像アップロードは以下の2方式を提供する。

- ファイル選択
- ドラッグ＆ドロップ

対応形式：

```text
JPG / JPEG
PNG
WebP
```

---

# 19. Frontend側のファイル検証

アップロード直後にFrontendでも基本的な検証を行う。

検証項目：

- ファイル形式
- MIME Type
- ファイルサイズ

ただし、Frontendの検証だけをセキュリティ対策として扱わない。

Backendでも必ず再検証する。

---

# 20. 画像プレビュー

ユーザーが画像を選択した場合、Frontendでは可能な限り即座にプレビューを表示する。

プレビューには、ブラウザのObject URLなどを利用できる。

不要になったObject URLは適切に破棄する。

---

# 21. ドラッグ＆ドロップ

ドラッグ＆ドロップ中はUIを変更し、ユーザーがドロップ可能な状態であることを視覚的に伝える。

例：

```text
通常
↓
「ここに画像をドロップ」

ドラッグ中
↓
「画像をここにドロップしてください」
```

ドロップ後は通常状態へ戻す。

---

# 22. 画像処理状態

画像処理状態は以下を基本とする。

```text
idle
↓
uploading
↓
uploaded
↓
analyzing
↓
processing
↓
completed
```

失敗時：

```text
error
```

Frontendは状態に応じてUIを変更する。

---

# 23. 処理中UI

処理中はユーザーに処理状態を明確に伝える。

例えば、

```text
配色を解析しています…
```

```text
画像を調整しています…
```

など。

処理中は、二重送信や同一処理の重複実行を防ぐ。

---

# 24. 自動調整

自動調整ボタンを押すと、Backend APIへ調整リクエストを送信する。

基本フロー：

```text
ユーザー操作
↓
入力値検証
↓
API Request
↓
analyzing
↓
processing
↓
API Response
↓
completed
↓
結果表示
```

Frontendでは自動調整のアルゴリズムそのものを実装しない。

---

# 25. 手動調整

以下の項目をFrontendで操作できるようにする。

- 色温度
- 彩度
- 明るさ
- コントラスト
- 色相

スライダー操作時には現在値を表示する。

例：

```text
彩度
──────●────────
      +12
```

---

# 26. 手動調整のプレビュー

手動調整中は、可能な範囲でユーザーが変更結果をリアルタイムに確認できるようにする。

ただし、最終的な画像変換はBackend側で行う。

Frontend上のプレビューはUX向上を目的としたプレビュー処理として扱う。

Frontendで行うプレビュー処理と、Backendで行う最終画像処理の結果に大きな差が出ないよう設計する。

---

# 27. プリセット

MVPでは以下のプリセットを提供する。

```text
ナチュラル
クール
ウォーム
シック
ソフト
```

プリセットを選択すると、対応するAdjustment値を設定する。

プリセット適用後もユーザーは手動調整できる。

---

# 28. Before / After

EditorではBefore / After比較UIを提供する。

基本構成：

```text
┌───────────────────────────┐
│          │                │
│  Before  │      After     │
│          │                │
│          │                │
└──────────┴────────────────┘
             ↑
         比較スライダー
```

対応操作：

- マウス
- タッチ
- キーボード

比較位置は0〜100%の範囲で扱う。

---

# 29. Result画面への遷移

調整が完了した場合、ユーザーはResult画面へ移動できる。

```text
Editor
 ↓
調整完了
 ↓
Result
```

Resultへ渡す情報：

- 元画像
- 調整後画像
- Palette
- PaletteRatio
- Adjustment
- 画像情報

---

# 30. Result状態

Result画面では以下の状態を扱う。

```text
ResultState
├── originalImage
├── processedImage
├── palette
├── paletteRatio
├── adjustment
├── analysis
└── export
```

---

# 31. Export

書き出し設定：

```text
format
quality
filename
```

対応形式：

```text
WebP
JPEG
PNG
```

デフォルト形式：

```text
WebP
```

---

# 32. 書き出し状態

```text
idle
↓
exporting
↓
completed
```

エラー時：

```text
error
```

書き出し中はボタンを無効化し、二重実行を防止する。

---

# 33. Settings

設定画面では以下を扱う。

```text
基本設定
外観
画像処理
書き出し
アニメーション
```

設定値はMVPではFrontendの Local Storage で永続化する。

キー：

```text
colorfit.settings
```

画像処理・書き出し形式など、まだ処理へ接続していない項目も保存する。
実際の画像処理や出力形式への反映は、対応するPhaseで行う。

---

# 34. Settingsの状態

概念的には以下とする。

```ts
type Settings = {
  theme: Theme;
  defaultFormat: ExportFormat;
  defaultQuality: ExportQuality;
  autoAdjust: boolean;
  adjustmentStrength: number;
  naturalColorPriority: boolean;
  preserveMetadata: boolean;
  filenameMode: FilenameMode;
  uiAnimation: AnimationMode;
  processingAnimation: boolean;
  reduceMotion: boolean;
};
```

---

# 35. 未保存状態

設定変更後、まだ保存されていない場合は、

```text
未保存の変更
```

などの状態を表示する。

保存完了後は未保存状態を解除する。

---

# 36. API Client

Backend APIとの通信処理はUIコンポーネントから直接実行しない。

基本的にAPI Client層を介して通信する。

例：

```text
Component
   ↓
Feature Hook
   ↓
API Client
   ↓
FastAPI
```

API Clientの詳細は `06_api.md` と整合させる。

---

# 37. API通信エラー

APIエラーは以下のように分類する。

```text
4xx
↓
ユーザー入力・リクエストの問題

5xx
↓
Backend側の問題

Network Error
↓
通信自体の問題
```

Frontendでは、ユーザーが理解できるメッセージへ変換して表示する。

Backendから返された内部エラー情報をそのまま表示しない。

---

# 38. Loading

API通信中は適切なLoading UIを表示する。

ただし、単純な全画面Spinnerだけに頼らず、処理内容に応じた表示を行う。

例：

```text
画像アップロード中…
```

```text
画像を解析しています…
```

```text
画像を調整しています…
```

```text
書き出しています…
```

---

# 39. UIコンポーネントとの責務分離

コンポーネントでは、

- UI表示
- ユーザー操作

を中心に担当する。

以下のような処理を1つのコンポーネントへ集中させない。

```text
UI
API通信
状態管理
画像処理
バリデーション
エラーハンドリング
```

これらは適切なFeature、Hook、Service、Utilityへ分離する。

具体的なComponent構成は `07_component-design.md` で定義する。

---

# 40. バリデーション

FrontendではZodを使用して入力値を検証する。

対象：

- HEXカラー
- 配色比率
- 調整値
- ファイル情報
- 書き出し設定
- 設定値

ただし、Frontendのバリデーションだけで入力を信頼しない。

Backendでも同じ入力を検証する。

---

# 41. 型安全性

TypeScriptの型を基本とし、可能な限り `any` の使用を避ける。

APIレスポンスについても型を定義する。

例：

```ts
type TransformResponse = {
  imageId: string;
  originalUrl: string;
  processedUrl: string;
  adjustment: Adjustment;
};
```

実際のAPI仕様は `06_api.md` で確定した内容と一致させる。

---

# 42. API型の整合性

FrontendとBackendでAPIの型定義が食い違わないようにする。

API仕様を変更した場合は、

- Backend Schema
- Frontend Type
- API Client
- 関連Hook
- UI

を確認する。

将来的にOpenAPIからTypeScript型を生成する方式も検討する。

---

# 43. Responsive Design

ColorFitは以下の画面サイズを基本対象とする。

```text
Desktop
Tablet
Mobile
```

具体的なBreakpointは `08_ui-guideline.md` で定義する。

---

# 44. Editor Responsive

Desktop：

```text
[配色設定] [画像プレビュー] [画像調整]
```

Tablet：

```text
[配色設定] [画像調整]
[    画像プレビュー    ]
```

Mobile：

```text
画像プレビュー
↓
ColorFitで調整
↓
デザインの配色
↓
画像調整
↓
書き出し
```

画面幅に応じて自然にレイアウトを変更する。

---

# 45. Settings Responsive

Desktopではサイドナビゲーションを使用する。

Mobileでは、

- セレクト
- タブ
- アコーディオン

などを使用して、操作しやすいUIへ変更する。

横スクロールは発生させない。

---

# 46. Animation

アニメーションにはGSAPを使用する。

主な用途：

- ページロード
- パネル表示
- カテゴリ切り替え
- Before / After
- 処理中演出
- 成功演出
- ボタンフィードバック

アニメーションはUIの意味を補助する目的で使用する。

---

# 47. Reduced Motion

`prefers-reduced-motion` を尊重する。

Reduced Motionが有効な場合：

- 装飾的なアニメーションを停止
- 移動量を減らす
- GSAPアニメーションを最小化
- 処理状態の視認性は維持する

「アニメーションを無効にする」場合でも、状態変化自体は明確に伝える。

---

# 48. アクセシビリティ

以下をFrontend実装時の基本要件とする。

- セマンティックHTML
- 適切なlabel
- キーボード操作
- フォーカス表示
- aria-label
- aria-live
- aria-pressed
- 適切なbutton要素
- 十分なコントラスト
- Reduced Motion

特にスライダー、トグル、ドラッグ＆ドロップ、モーダルなどはキーボード操作を考慮する。

---

# 49. 画像アクセシビリティ

画像には適切な `alt` を設定する。

装飾目的の画像については適切に扱う。

Before / After比較については、スクリーンリーダーでも調整前・調整後の状態が理解できるようにする。

---

# 50. セキュリティ

Frontend側では以下を実施する。

- ユーザー入力の検証
- ファイル形式検証
- ファイルサイズ検証
- 不要なHTML挿入を行わない
- API URLなどの環境変数管理
- 秘密情報をFrontendへ含めない

Frontendの検証はセキュリティ対策の最終防衛線ではない。

Backendでも必ず検証する。

---

# 51. 環境変数

Frontendで利用する環境変数はViteのルールに従う。

例：

```text
VITE_API_BASE_URL
```

Frontendに公開される環境変数には、秘密情報を含めない。

API Secretなどの機密情報はBackend側で管理する。

---

# 52. CORS

FrontendとBackendが別Originとなるため、Backend側でFrontendのOriginを適切に許可する。

開発環境とProduction環境でOriginを分離する。

例：

```text
Development
http://localhost:5173

Production
https://<frontend-domain>
```

実際のDomainはデプロイ時に決定する。

---

# 53. テスト

Frontendでは以下のテストを実施する。

## Unit Test

対象：

- color utility
- validation
- file utility
- formatter

## Component Test

対象：

- ColorPicker
- Slider
- Upload
- Before / After
- Toggle
- Export form

## Integration Test

対象：

- Editor操作
- API通信
- Result表示
- Settings保存

## E2E Test

主要ユーザーフロー：

```text
ホーム
 ↓
エディター
 ↓
配色設定
 ↓
画像アップロード
 ↓
ColorFit実行
 ↓
結果確認
 ↓
書き出し
```

---

# 54. テスト方針

新しいFrontend機能を追加する場合、原則として対応するテストを追加する。

既存機能へ影響する変更を行った場合は、関連テストおよび回帰テストを実行する。

---

# 55. パフォーマンス

Frontendでは不要な再レンダリングを避ける。

特に以下を考慮する。

- 大きな画像の扱い
- スライダー操作
- Before / After操作
- GSAPアニメーション
- API通信
- Object URL
- 大量のState更新

手動調整スライダーなどでは、必要に応じて処理をDebounce / Throttleする。

---

# 56. 画像プレビューとBackend処理の分離

Editorではユーザーがスライダーを操作するたびにBackendへリクエストを送信する設計にはしない。

基本方針：

```text
ユーザー操作
    ↓
Frontendプレビュー
    ↓
調整確定
    ↓
Backend処理
```

これにより不要なAPI通信を抑える。

ただし、最終的な画像処理はBackend側で行う。

---

# 57. APIリクエストの重複防止

画像処理や書き出しなどの処理中は、同一処理の二重実行を防止する。

例：

```text
処理中
↓
「ColorFitで調整する」ボタンをDisabled
```

処理完了またはエラー時に再び操作可能にする。

---

# 58. UIリファレンスとの整合性

Frontend実装では以下をUIリファレンスとして使用する。

```text
docs/ui-reference/
├── 01-home/
├── 02-editor/
├── 03-result/
└── 04-settings/
```

UI実装時には以下を可能な限り統一する。

- レイアウト
- タイポグラフィ
- カラー
- グリッド
- グロー
- ガラスパネル
- ボタン
- フォーム
- 余白
- Border Radius
- アニメーション

ただし、HTML/CSS/JavaScriptモックをそのままReactへコピーするのではなく、Reactコンポーネントとして適切に再構成する。

---

# 59. UIガイドラインとの関係

UIの具体的なルールは、

```text
docs/08_ui-guideline.md
```

で定義する。

Frontend詳細設計では、

```text
Frontend
   ↓
UI Guideline
   ↓
Component
```

という関係を基本とする。

---

# 60. Component Designとの関係

コンポーネントの詳細については、

```text
docs/07_component-design.md
```

で定義する。

本書ではFeature単位の構造を定義し、具体的なPropsやComponent階層はComponent Designへ委譲する。

---

# 61. FrontendとBackendの境界

基本的な責務分担は以下とする。

| 処理             | Frontend | Backend |
| ---------------- | -------: | ------: |
| UI表示           |        ○ |       - |
| フォーム入力     |        ○ |       - |
| HEX検証          |        ○ |       ○ |
| ファイル選択     |        ○ |       - |
| ファイル基本検証 |        ○ |       ○ |
| 画像プレビュー   |        ○ |       - |
| 配色入力         |        ○ |       ○ |
| 画像解析         |        - |       ○ |
| 色マッチング     |        - |       ○ |
| 最終画像処理     |        - |       ○ |
| API通信          |        ○ |       - |
| Storage操作      |        - |       ○ |
| 書き出し画像生成 |        - |       ○ |
| ダウンロード操作 |        ○ |       ○ |

Backend側でも入力値を検証するため、Frontendの検証だけを信頼しない。

---

# 62. データフロー

基本的なFrontendとBackend間のデータフロー：

```text
                    Frontend
                       │
                       │
             ┌─────────┴─────────┐
             │                   │
             ↓                   ↓
        Palette             Image File
             │                   │
             └─────────┬─────────┘
                       ↓
                   FastAPI
                       │
                       ↓
              Image Processing
                       │
                       ↓
                Processed Image
                       │
                       ↓
                   Frontend
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
        Preview              Result
```

---

# 63. エラー表示

エラーはユーザーが次に取るべき行動を理解できるようにする。

悪い例：

```text
Error: 422
```

良い例：

```text
画像のサイズが大きすぎます。
別の画像を選択してください。
```

必要に応じて、

```text
再試行
```

ボタンを表示する。

---

# 64. 通知

軽微な操作結果にはToastなどのフィードバックを使用できる。

例：

```text
設定を保存しました。
```

```text
画像を書き出しました。
```

重要なエラーや確認操作にはToastだけで済ませず、ユーザーが認識できるUIを使用する。

---

# 65. LoadingとErrorの原則

すべての非同期処理では、

```text
Idle
Loading
Success
Error
```

の状態を考慮する。

UI上で状態が不明になることを避ける。

---

# 66. 画面離脱

画像処理中にユーザーが画面を離れた場合の挙動については、MVPでは過度に複雑な制御を行わない。

ただし、処理中であることをユーザーに伝え、可能な限り誤操作を防止する。

将来的に長時間処理やJob Queueを導入する場合は、別途設計する。

---

# 67. 将来の拡張性

将来的に以下の機能を追加できる構造を意識する。

- ユーザーアカウント
- プロジェクト
- 調整履歴
- 配色パレット保存
- 複数画像処理
- チーム共有
- Figma連携

ただし、MVPではこれらを実装しない。

将来機能のためにFrontendを過度に複雑化しない。

---

# 68. 実装時の原則

Frontend実装では以下を原則とする。

1. TypeScriptを使用する。
2. `any` の使用を原則禁止する。
3. UIとロジックを適切に分離する。
4. API通信をComponentへ直接記述しない。
5. Frontendの入力値をBackendでも検証する。
6. 不要なGlobal Stateを作らない。
7. Feature単位でコードを整理する。
8. 共通UIは再利用可能なComponentとして設計する。
9. UIリファレンスとの整合性を保つ。
10. 新機能には対応するテストを追加する。
11. アクセシビリティを考慮する。
12. `prefers-reduced-motion` を尊重する。
13. 大きな画像を扱うことを考慮してパフォーマンスを維持する。
14. Frontendに秘密情報を保存しない。
15. Backendの内部実装をFrontendへ漏らさない。

---

# 69. 完了条件

Frontend詳細設計は以下を満たすことを完了条件とする。

- [ ] Frontend技術スタックが定義されている
- [ ] Frontendの責務が定義されている
- [ ] ディレクトリ構成が定義されている
- [ ] React Routerのルートが定義されている
- [ ] 状態管理方針が定義されている
- [ ] Editor状態が定義されている
- [ ] Result状態が定義されている
- [ ] Settings状態が定義されている
- [ ] 画像アップロード方針が定義されている
- [ ] API通信方針が定義されている
- [ ] バリデーション方針が定義されている
- [ ] エラー処理方針が定義されている
- [ ] Responsive方針が定義されている
- [ ] アニメーション方針が定義されている
- [ ] Accessibility方針が定義されている
- [ ] テスト方針が定義されている
- [ ] Frontend / Backendの責務境界が明確になっている
- [ ] Component Designへ引き渡す内容が明確になっている
