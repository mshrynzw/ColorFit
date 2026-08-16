# ColorFit UI Guideline

## 1. 文書概要

### 1.1 目的

本書は、ColorFitのFrontend UIを一貫したVisual Designで実装するためのUI Guidelineを定義する。

対象：

- Color
- Typography
- Spacing
- Layout
- Grid
- Border
- Radius
- Shadow
- Glow
- Icon
- Button
- Form
- Card
- Image
- Navigation
- Animation
- Responsive Design
- Accessibility
- Loading
- Error
- Empty State

---

# 2. UI Design Concept

ColorFitのUIは以下をDesign Conceptとする。

```text
近未来
テクノロジー
クリエイティブ
クリーン
ミニマル
プロフェッショナル
```

Webデザイナーが使用するToolとして、

```text
「高機能だが難しくない」
```

と感じられるUIを目指す。

---

# 3. Visual Direction

ColorFitのVisual Designでは、

```text
Dark UI
+
Vivid Accent Color
+
Glow
+
Glass / Transparency
+
Subtle Animation
```

を基本とする。

---

# 4. Design Principle

UIでは以下を優先する。

1. 情報の視認性
2. 操作の分かりやすさ
3. Visual Hierarchy
4. 一貫性
5. 近未来的な世界観
6. AnimationによるFeedback
7. Responsive Design
8. Accessibility

---

# 5. UI Reference

Visual Designの基準として以下を使用する。

```text
docs/ui-reference/
├── 01-home/
├── 02-editor/
├── 03-result/
└── 04-settings/
```

これらを実装時のVisual Referenceとする。

---

# 6. UI Referenceの優先順位

UI実装時は以下の優先順位で判断する。

```text
1. UI Reference
2. 本UI Guideline
3. Component Design
4. Feature Design
5. 個別Componentの判断
```

UI Referenceと実装に差異がある場合、意図的な変更でなければUI Referenceを優先する。

---

# 7. Color System

ColorFitではDark Themeを基本とする。

---

# 8. Background Color

Application BackgroundはDark Colorを使用する。

Concept：

```text
Deep Black
Deep Navy
Dark Blue
```

完全なPure Blackのみで画面を構成せず、わずかにColorを持たせる。

---

# 9. Surface Color

CardやPanelなどにはBackgroundより少し明るいSurface Colorを使用する。

例：

```text
Background
    ↓
Surface
    ↓
Elevated Surface
```

---

# 10. Surface Hierarchy

UIの奥行きを以下のように表現する。

```text
Background
↓
Surface
↓
Elevated Surface
↓
Modal / Overlay
```

---

# 11. Primary Accent Color

ColorFitのPrimary AccentにはVividなBlue / Cyan系Colorを基本とする。

用途：

- Primary Button
- Link
- Active State
- Focus
- Glow
- Progress
- Selected State

---

# 12. Secondary Accent

Secondary AccentとしてPurple / Violet系Colorを使用できる。

用途：

- Gradient
- Decorative Element
- Secondary Highlight
- Background Glow

---

# 13. Accent Gradient

ColorFitではGradientをVisual Identityとして利用する。

Concept：

```text
Cyan
    ↓
Blue
    ↓
Violet
```

ただしGradientをすべてのUIへ適用しない。

---

# 14. Text Color

Textは以下のHierarchyを基本とする。

```text
Primary Text
Secondary Text
Muted Text
Disabled Text
```

---

# 15. Primary Text

Headingや重要情報には高ContrastのText Colorを使用する。

基本：

```text
White
または
Very Light Gray
```

---

# 16. Secondary Text

補足情報にはPrimary Textより弱いColorを使用する。

例：

```text
Light Gray
```

---

# 17. Muted Text

Placeholderや補足説明にはMuted Colorを使用する。

---

# 18. Disabled Text

Disabled状態ではText Contrastを下げる。

ただしAccessibilityを損なわないようにする。

---

# 19. Semantic Color

状態をColorで表現する。

基本：

```text
Success
Warning
Error
Info
```

---

# 20. Success Color

Processing完了などに使用する。

Concept：

```text
Green
```

---

# 21. Warning Color

注意状態に使用する。

Concept：

```text
Amber / Yellow
```

---

# 22. Error Color

Error状態に使用する。

Concept：

```text
Red
```

---

# 23. Info Color

Information表示に使用する。

Concept：

```text
Blue / Cyan
```

---

# 24. Color Token

実装ではColorを直接Hard Codingするのではなく、Design Tokenとして管理する。

概念：

```text
--color-background
--color-surface
--color-surface-elevated
--color-primary
--color-secondary
--color-text
--color-text-muted
--color-success
--color-warning
--color-error
```

---

# 25. Color Usage Rule

Accent Colorは重要なInteractive Elementへ使用する。

画面全体をAccent Colorで埋め尽くさない。

---

# 26. Glow

近未来的なVisual表現としてGlowを使用する。

主な用途：

```text
Button
Active Element
Hero
Selected Color
Processing
Decorative Element
```

---

# 27. Glowの原則

GlowはSubtleに使用する。

強すぎるGlowによって、

- Textが読みにくくなる
- UIが派手すぎる
- Hierarchyが崩れる

ことを避ける。

---

# 28. Glow Level

基本的に3段階で管理する。

```text
Subtle
Medium
Strong
```

通常のUIではSubtleを基本とする。

---

# 29. Glass Effect

PanelやCardには必要に応じてGlass Effectを使用する。

Concept：

```text
Semi Transparent Background
+
Backdrop Blur
+
Subtle Border
```

---

# 30. Glass Effectの原則

Glass EffectをすべてのElementへ適用しない。

重要なPanelやOverlayなどへ限定する。

---

# 31. Border

BorderはSubtleなContrastで使用する。

用途：

- Card
- Input
- Panel
- Divider
- Button

---

# 32. Border Color

BorderはBackgroundとのContrastを小さくする。

強い白Borderを大量に使用しない。

---

# 33. Active Border

Selected / Focus状態ではAccent ColorをBorderへ使用してよい。

---

# 34. Border Width

基本：

```text
1px
```

を使用する。

重要なHighlightのみ2pxを検討する。

---

# 35. Border Radius

UI全体でRadiusを統一する。

基本Token：

```text
Small
Medium
Large
XL
Full
```

---

# 36. Radius Usage

```text
Small
↓
Input / Badge

Medium
↓
Button / Card

Large
↓
Panel / Hero

Full
↓
Pill / Tag
```

---

# 37. Button Radius

Buttonは適度にRoundedさせる。

極端なPill ShapeはPrimary Buttonなど、意図したUIに限定する。

---

# 38. Card Radius

CardはButtonより大きめのRadiusを使用する。

---

# 39. Spacing System

Spacingは統一されたScaleを使用する。

基本単位：

```text
4px
```

---

# 40. Spacing Scale

基本：

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

---

# 41. Micro Spacing

```text
4px
8px
```

用途：

- IconとText
- LabelとInput
- Badge
- Inline Element

---

# 42. Component Spacing

```text
12px
16px
20px
24px
```

用途：

- Form
- Card
- Button Group
- Component内部

---

# 43. Section Spacing

```text
32px
40px
48px
64px
```

用途：

- Section
- Panel
- Page Content

---

# 44. Hero Spacing

Heroなど大きなVisual Sectionでは、

```text
64px
80px
96px
```

などを使用する。

---

# 45. Layout

LayoutはVisual Hierarchyを優先する。

基本：

```text
Header
↓
Main Content
↓
Footer
```

---

# 46. Container

Page ContentにはMaximum Widthを設定する。

概念：

```text
max-width
+
auto margin
+
responsive padding
```

---

# 47. Page Padding

Desktopでは適度なHorizontal Paddingを設定する。

Mobileでは画面幅を有効利用する。

---

# 48. Grid

Editorなど複数Panelを持つ画面ではGrid Layoutを基本とする。

Desktop：

```text
┌─────────────────────────────┐
│ Image Area │ Settings Area  │
└─────────────────────────────┘
```

---

# 49. Mobile Layout

Mobileでは基本的にVertical Stackへ変更する。

```text
Image
↓
Settings
↓
Processing
```

---

# 50. Editor Layout

Desktop：

```text
Image Preview
        │
        ├── Palette
        ├── Ratio
        └── Strength
```

Mobile：

```text
Image Preview
↓
Palette
↓
Ratio
↓
Strength
↓
Process
```

---

# 51. Result Layout

Desktop：

```text
Original
     │
     │
Processed
```

またはSide-by-Side。

MobileではVertical Stackを基本とする。

---

# 52. Typography

TypographyはModern / Clean / Technicalな印象を目指す。

---

# 53. Font Family

基本FontはSans-serifを使用する。

日本語Textについては日本語対応Fontを優先する。

例：

```text
Noto Sans JP
```

など。

---

# 54. Font Weight

基本：

```text
Regular
Medium
Semibold
Bold
```

---

# 55. Heading

HeadingはBold / Semiboldを基本とする。

---

# 56. Body

Body TextはRegularを基本とする。

---

# 57. Label

Form LabelはMediumまたはSemiboldを使用する。

---

# 58. Caption

補足情報はSmall Size + Muted Colorを使用する。

---

# 59. Typography Scale

基本例：

```text
Display
48px

H1
40px

H2
32px

H3
24px

H4
20px

Body
16px

Small
14px

Caption
12px
```

実装時はResponsiveに調整する。

---

# 60. Mobile Typography

MobileではHeading Sizeを縮小する。

例：

```text
Display
36px

H1
32px

H2
28px

H3
22px

Body
16px
```

---

# 61. Line Height

基本：

```text
Heading
1.1 ～ 1.3

Body
1.5 ～ 1.7
```

---

# 62. Letter Spacing

Headingでは必要に応じてLetter Spacingを調整する。

Bodyでは過剰にLetter Spacingを変更しない。

---

# 63. Monospace

Technical InformationなどにはMonospace Fontを使用してもよい。

用途：

```text
HEX Color
Code
Technical Value
```

---

# 64. Button

Buttonは明確なVisual Hierarchyを持たせる。

---

# 65. Primary Button

Primary Action。

例：

```text
カラーリングを実行
```

Visual：

```text
Accent Color
+
Glow
+
Strong Contrast
```

---

# 66. Secondary Button

Secondary Action。

例：

```text
戻る
キャンセル
```

SubtleなBorder / Surfaceを使用する。

---

# 67. Ghost Button

低Priority Actionに使用する。

Backgroundを基本的にTransparentにする。

---

# 68. Danger Button

削除などの破壊的操作に使用する。

Error Colorを使用する。

---

# 69. Button Size

基本：

```text
Small
Medium
Large
```

---

# 70. Button Touch Target

Mobileでは十分なTouch Targetを確保する。

---

# 71. Button State

Buttonには以下のStateを定義する。

```text
Default
Hover
Active
Focus
Disabled
Loading
```

---

# 72. Button Hover

Hoverでは、

- Brightness
- Glow
- Border
- Transform

などをSubtleに変更する。

---

# 73. Button Loading

Loading中はActionの重複実行を防止する。

例：

```text
処理中...
```

---

# 74. Input

InputはDark Surfaceを基本とする。

```text
Background
+
Border
+
Light Text
```

---

# 75. Input Focus

Focus時：

```text
Accent Border
+
Subtle Glow
```

を使用してよい。

---

# 76. Input Error

Error時は、

```text
Error Border
+
Error Message
```

を表示する。

---

# 77. Input Placeholder

PlaceholderはPrimary Textより弱いColorにする。

---

# 78. Color Input

HEX InputではColor Previewを併設する。

例：

```text
┌────┐ ┌─────────┐
│    │ │ #00D9FF │
└────┘ └─────────┘
```

---

# 79. Color Picker

Color Pickerは直感的に操作できるようにする。

---

# 80. Ratio Input

Ratioは数値だけでなくVisualでも理解できるようにする。

例：

```text
Primary      60%
██████████████████

Secondary   30%
█████████

Accent      10%
███
```

---

# 81. Ratio Validation

Ratio合計が100%になっているか視覚的に表示する。

例：

```text
Total: 100%
```

Valid：

```text
✓ 配色比率が正しく設定されています
```

Invalid：

```text
⚠ 配色比率の合計を100%にしてください
```

---

# 82. Slider

SliderはAccent ColorをTrack / Thumbへ使用してよい。

---

# 83. Slider State

```text
Default
Hover
Focus
Disabled
```

を定義する。

---

# 84. Slider Label

Sliderには現在値を表示する。

例：

```text
適用強度
70%
```

---

# 85. Card

Cardは情報をGroup化する。

---

# 86. Card Background

Backgroundとの差をSubtleにする。

---

# 87. Card Border

Subtle Borderを基本とする。

---

# 88. Card Shadow

Dark Themeでは強いShadowより、

```text
Border
+
Glow
+
Background Contrast
```

を優先してもよい。

---

# 89. Panel

EditorのSettings PanelなどはCardより大きなContainerとして扱う。

---

# 90. Panel Hierarchy

```text
Page Background
↓
Panel
↓
Card
↓
Input
```

というVisual Hierarchyを作る。

---

# 91. Header

HeaderはApplicationのIdentityとNavigationを提供する。

---

# 92. Header Background

Dark / Semi-transparentを基本とする。

必要に応じてBackdrop Blurを使用する。

---

# 93. Header Border

Bottom BorderをSubtleに設定する。

---

# 94. Navigation

Active RouteをAccent Colorで明示する。

---

# 95. Navigation Hover

Hover時にはColor / Background / GlowなどをSubtleに変更する。

---

# 96. Mobile Navigation

MobileではNavigationをMenuへまとめる。

---

# 97. Hero

Home PageではHeroをVisual Identityの中心とする。

---

# 98. Hero Visual

Heroでは、

```text
Gradient
Glow
Grid
Particle
Abstract Shape
```

などを使用してもよい。

---

# 99. Hero Text

Hero Headingは大きく表示する。

---

# 100. Hero CTA

Primary CTAを明確にする。

---

# 101. Feature Section

Feature Sectionでは情報をCard形式などで整理する。

---

# 102. Feature Icon

Feature IconはAccent Colorを使用してよい。

---

# 103. Result Page

Result Pageでは、

```text
「処理が完了した」
```

ことを最も重要なInformationとして伝える。

---

# 104. Before / After

Before / Afterは一目で違いが理解できるようにする。

---

# 105. Image Comparison

OriginalとProcessedを明確に区別する。

例：

```text
BEFORE
AFTER
```

または日本語：

```text
変更前
変更後
```

---

# 106. Result Success

Result PageではSuccess StateをVisualに表現してよい。

例：

```text
✓
カラーリング完了
```

---

# 107. Download CTA

Download ButtonはResult Pageで明確に目立たせる。

---

# 108. Settings Page

Settingsは複雑になりすぎないようにする。

---

# 109. Settings Group

SettingsをCategoryごとにGroup化する。

例：

```text
Appearance
Processing
About
```

---

# 110. Settings Row

基本：

```text
Label
Description
Control
```

の構成とする。

---

# 111. Divider

Settings Section間にDividerを使用してもよい。

DividerはSubtleにする。

---

# 112. Modal

Modalを使用する場合：

```text
Overlay
↓
Dialog
↓
Content
```

とする。

---

# 113. Modal Overlay

BackgroundをDark Overlayにする。

必要に応じてBackdrop Blurを使用する。

---

# 114. Modal Accessibility

ModalではFocus管理を行う。

EscapeによるCloseなども検討する。

---

# 115. Toast

Toastは一時的なFeedbackに使用する。

---

# 116. Toast Position

基本：

```text
Desktop
Bottom Right
```

Mobileでは画面幅を考慮する。

---

# 117. Toast Duration

短時間で自動Dismissする。

ただし重要なErrorはToastだけにしない。

---

# 118. Loading

Loadingは現在何をしているのか理解できるようにする。

悪い例：

```text
Loading...
```

良い例：

```text
画像を解析しています...
```

---

# 119. Processing Animation

Processing中は近未来的なAnimationを使用してよい。

例：

```text
Scanning
Analyzing
Matching
Generating
```

ただし実際のProcessing状態と誤認させない。

---

# 120. Progress

実際のProgressが取得できない場合、偽のPercentageを表示しない。

---

# 121. Skeleton

ResultなどでLoading時間が発生する場合、Skeletonを利用してよい。

---

# 122. Error UI

Errorはユーザーが次に何をすればよいか分かるようにする。

---

# 123. Error Message

基本構造：

```text
何が起きたか
+
どうすればよいか
```

例：

```text
画像を処理できませんでした。
画像を確認して、もう一度お試しください。
```

---

# 124. Error Color

Error Colorを使用するが、画面全体をRedにしない。

---

# 125. Empty State

Empty Stateには、

```text
Icon / Illustration
Heading
Description
CTA
```

などを使用する。

---

# 126. Image Upload Empty State

例：

```text
画像をアップロードしてください

Webデザインの画像をアップロードすると、
配色に合わせて画像を調整できます。

[画像をアップロード]
```

---

# 127. Responsive Design

ColorFitはMobile Firstを基本思想とする。

---

# 128. Breakpoint

Tailwind CSSの標準Breakpointを基本として利用する。

概念：

```text
sm
md
lg
xl
2xl
```

必要以上にCustom Breakpointを増やさない。

---

# 129. Mobile

Mobileでは、

- Single Column
- Vertical Stack
- Compact Navigation
- Touch Friendly Control

を基本とする。

---

# 130. Tablet

Tabletでは、

- 2 Column
- Flexible Grid
- Larger Content Area

などを使用する。

---

# 131. Desktop

Desktopでは、

- Multi Column
- Large Hero
- Side Panel
- Spacious Layout

を利用できる。

---

# 132. Responsive Typography

Screen Sizeに応じてHeadingを縮小する。

---

# 133. Responsive Spacing

MobileではDesktopよりSpacingを縮小する。

ただしTouch Targetは十分に確保する。

---

# 134. Responsive Image

ImageはContainer Widthを超えないようにする。

基本：

```text
max-width: 100%
height: auto
```

---

# 135. Aspect Ratio

Image PreviewではOriginal Aspect Ratioを可能な限り維持する。

---

# 136. Overflow

Horizontal Overflowを意図せず発生させない。

---

# 137. Accessibility

UIはAccessibilityを考慮して実装する。

---

# 138. Contrast

TextとBackgroundには十分なContrastを確保する。

Dark UIでもContrastを下げすぎない。

---

# 139. Focus Indicator

Keyboard操作時にFocusが明確に分かるようにする。

---

# 140. Keyboard Navigation

Interactive ElementはKeyboardで操作可能にする。

---

# 141. Screen Reader

必要なUIには適切なARIA Attributeを使用する。

---

# 142. Icon Accessibility

Icon ButtonにはAccessible Nameを設定する。

例：

```text
aria-label="画像を削除"
```

---

# 143. Reduced Motion

`prefers-reduced-motion`を尊重する。

Animationを無効化または簡略化する。

---

# 144. Animation System

Animationは以下の目的に限定する。

```text
Feedback
Transition
Navigation
Hierarchy
Branding
```

---

# 145. Animation Duration

基本：

```text
Fast
100～150ms

Normal
200～300ms

Slow
400～600ms
```

複雑なAnimationはこれ以上になる場合もある。

---

# 146. Easing

基本的にNaturalなEasingを使用する。

例：

```text
ease-out
ease-in-out
```

---

# 147. Hover Animation

Hover Animationは短くする。

---

# 148. Page Transition

Page TransitionはContentを見失わない程度に短くする。

---

# 149. GSAP

GSAPは複雑なAnimationへ使用する。

例：

```text
Hero
Particle
Image Reveal
Complex Transition
```

---

# 150. Tailwind CSS

通常のLayout / Spacing / Responsive / StateにはTailwind CSSを優先する。

---

# 151. Custom CSS

Tailwindだけでは表現しづらい、

```text
Complex Animation
Glow
Advanced Background
Custom Effect
```

などに限定してCustom CSSを使用する。

---

# 152. GSAPとTailwind

役割を分離する。

```text
Tailwind
↓
Layout / Style / Responsive

CSS
↓
Simple Animation / Effect

GSAP
↓
Complex Animation
```

---

# 153. Gradient

GradientはHeroやAccentなど、Visual Highlightに限定して使用する。

---

# 154. Background Decoration

Backgroundには、

```text
Grid
Glow
Gradient
Particle
```

などのDecorationを使用できる。

ただしContentの視認性を妨げない。

---

# 155. Grid Background

近未来的なGrid Backgroundを使用する場合、Contrastを非常に弱くする。

---

# 156. Particle

Particle Animationを使用する場合、UI操作を妨げない。

---

# 157. Noise / Texture

NoiseやTextureはSubtleに使用する。

---

# 158. Visual Density

ColorFitは情報量が多すぎないClean UIを基本とする。

---

# 159. Whitespace

Whitespaceを十分に確保する。

近未来的なUIでも情報を詰め込みすぎない。

---

# 160. Visual Hierarchy

重要度：

```text
Primary
↓
Secondary
↓
Supporting
↓
Decorative
```

の順にVisual Weightを下げる。

---

# 161. Accent Usage

Accent ColorはVisual Hierarchyのために使用する。

Accentが多すぎて、

```text
「何が重要なのか分からない」
```

状態を作らない。

---

# 162. Dark Theme

Dark Themeでは、

```text
Background
Surface
Border
Text
Accent
```

のContrastを丁寧に設定する。

---

# 163. Surface Depth

ElevationをShadowだけでなく、

```text
Background Color
Border
Glow
Blur
```

でも表現する。

---

# 164. Component Consistency

同じComponentはどのPageでも同じVisual Ruleを使用する。

---

# 165. Button Consistency

Primary ButtonはHome / Editor / Resultで同じ基本Designを使用する。

---

# 166. Input Consistency

InputはPageごとに別Designを作らない。

---

# 167. Card Consistency

CardのRadius / Border / Background / Paddingを統一する。

---

# 168. Icon System

Iconは同じIcon Libraryを基本とする。

---

# 169. Icon Style

Icon Stroke WidthやSizeを統一する。

---

# 170. Icon Size

基本：

```text
16px
20px
24px
32px
```

---

# 171. Icon + Text

IconとTextの間隔を統一する。

基本：

```text
8px
```

---

# 172. Logo

ColorFit LogoはApplication IdentityとしてHeaderやHome Heroなどで使用する。

---

# 173. Logo Clear Space

Logo周辺には十分なWhitespaceを確保する。

---

# 174. Logo Color

Dark BackgroundではLight Logoを基本とする。

---

# 175. Image Preview Background

Transparent ImageやDark Imageを表示する場合、Preview Backgroundを用意する。

---

# 176. Image Checkerboard

Transparencyを表示する必要がある場合はCheckerboard Backgroundを検討する。

---

# 177. Image Border

Image PreviewにはSubtle Borderを使用してよい。

---

# 178. Before / After Label

Before / After Labelは明確に表示する。

---

# 179. Result Download

Download ButtonはResult Pageの主要CTAとして扱う。

---

# 180. Destructive Action

削除操作はPrimary Actionと明確に区別する。

---

# 181. Confirmation Dialog

重要なDelete操作ではConfirmation Dialogを検討する。

---

# 182. Settings Control

SettingsではControlの意味が明確になるようにする。

---

# 183. Settings Description

設定項目には必要に応じて短いDescriptionを付ける。

---

# 184. Form Group

関連するForm FieldをGroup化する。

---

# 185. Form Error

Error Messageは該当Inputの近くに表示する。

---

# 186. Form Success

Success状態は必要な場合のみ表示する。

---

# 187. Responsive Form

MobileではForm Fieldを基本的にFull Widthにする。

---

# 188. Touch Target

Interactive Elementは十分なTouch Areaを確保する。

---

# 189. Mobile Editor

Editorの操作順序を、

```text
Upload
↓
Palette
↓
Ratio
↓
Strength
↓
Process
```

と理解しやすい順番にする。

---

# 190. Desktop Editor

DesktopではImage PreviewとSettingsを同時に確認できるLayoutを優先する。

---

# 191. Result Page Hierarchy

Result Pageでは、

```text
Result Status
↓
Image Comparison
↓
Result Information
↓
Download
```

の順にVisual Hierarchyを作る。

---

# 192. Home Page Hierarchy

Homeでは、

```text
Brand
↓
Value Proposition
↓
CTA
↓
Feature
↓
Secondary CTA
```

の順を基本とする。

---

# 193. Settings Hierarchy

Settingsでは、

```text
Page Title
↓
Category
↓
Setting
↓
Description
```

の順に整理する。

---

# 194. UI Copy

UI Textは日本語を基本とする。

---

# 195. Copy Tone

文章は、

```text
簡潔
分かりやすい
親切
専門的すぎない
```

を基本とする。

---

# 196. Button Copy

ButtonにはActionを明確に表すTextを使用する。

良い例：

```text
画像をアップロード
カラーリングを実行
結果をダウンロード
```

---

# 197. Error Copy

Error Messageでは技術用語を避ける。

悪い例：

```text
HTTP 422
```

良い例：

```text
画像の形式を確認してください。
```

---

# 198. Loading Copy

Loading Messageは現在行っている処理を伝える。

例：

```text
画像をアップロードしています...
画像を解析しています...
カラーリングしています...
```

---

# 199. Empty Copy

Empty Stateではユーザーに次のActionを示す。

---

# 200. Japanese Typography

日本語Textでは、

- 適切なLine Height
- 適切なLetter Spacing
- 適切なFont Weight

を設定する。

---

# 201. English / Japanese Mixed Text

ColorFitでは日本語と英語が混在する可能性がある。

例：

```text
Color Matching
カラーリング
```

Visual Weightが不自然にならないようFontを調整する。

---

# 202. Technical Text

HEX ColorなどTechnical InformationにはMonospaceを使用してよい。

---

# 203. AccessibilityとColor

Colorだけで状態を伝えない。

例：

```text
Red
+
Error Icon
+
Error Message
```

などを組み合わせる。

---

# 204. AccessibilityとAnimation

Animationだけで重要な状態を伝えない。

---

# 205. AccessibilityとDisabled

Disabled状態でもユーザーが操作不可であることを理解できるようにする。

---

# 206. Performance

Decorative AnimationはPerformanceへの影響を考慮する。

---

# 207. GPU Animation

Transform / OpacityなどPerformanceに配慮したAnimationを優先する。

---

# 208. Heavy Effect

Backdrop FilterやBlurなどのHeavy Effectを大量に使用しない。

---

# 209. Mobile Performance

Mobileでは、

```text
Particle
Blur
Glow
Complex Animation
```

などを必要に応じて削減する。

---

# 210. Image Performance

Image Previewは必要以上に高解像度でRenderingしない。

---

# 211. Loading Performance

Initial Page Loadを重くしない。

不要なAnimation LibraryやAssetを初期Loadへ大量に含めない。

---

# 212. Component UI Token

Componentでは以下のTokenを利用する。

```text
Color
Spacing
Typography
Radius
Shadow
Glow
Animation
Breakpoint
```

---

# 213. Design Token Example

概念：

```css
:root {
  --color-background: ...;
  --color-surface: ...;
  --color-primary: ...;
  --color-secondary: ...;

  --spacing-xs: ...;
  --spacing-sm: ...;
  --spacing-md: ...;
  --spacing-lg: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;
}
```

実際の値はUI Referenceと実装結果を確認して調整する。

---

# 214. Tailwind Token

Tailwind CSSではTheme設定を利用してDesign Tokenを共通化する。

---

# 215. CSS Variable

Theme変更などが必要なColorはCSS Variableを利用してもよい。

---

# 216. Theme

MVPの既定 Theme は Dark とする。

Settings から Dark / Light / System を切り替えられる。System は `prefers-color-scheme` に従う。

Light Theme は Color Token（CSS Variable）を差し替えて適用する。

---

# 217. Theme Architecture

```text
Component
 ↓
Design Token
 ↓
Theme
 ↓
Actual Color
```

Componentへ直接Color Valueを大量に書かない。

---

# 218. Design Token変更

Design Tokenを変更した場合、Application全体へ影響するため慎重に変更する。

---

# 219. UI Review

UI実装後は以下を確認する。

- [ ] UI Referenceと一致している
- [ ] Colorが統一されている
- [ ] Typographyが統一されている
- [ ] Spacingが統一されている
- [ ] Borderが統一されている
- [ ] Radiusが統一されている
- [ ] Buttonが統一されている
- [ ] Inputが統一されている
- [ ] Animationが統一されている

---

# 220. Responsive Review

以下の画面幅で確認する。

```text
Mobile
Tablet
Desktop
Large Desktop
```

---

# 221. Browser Review

主要Browserで表示を確認する。

対象：

```text
Chrome
Edge
Safari
Firefox
```

優先順位はProjectのTarget Userに応じて調整する。

---

# 222. Accessibility Review

- [ ] Keyboard操作
- [ ] Focus
- [ ] Contrast
- [ ] Screen Reader
- [ ] Reduced Motion
- [ ] Form Label
- [ ] Error Message
- [ ] Image Alt

を確認する。

---

# 223. Animation Review

- [ ] Animationが速すぎない
- [ ] Animationが遅すぎない
- [ ] UI操作を邪魔しない
- [ ] Loading状態が分かる
- [ ] Reduced Motionに対応している
- [ ] GSAPがCleanupされている

---

# 224. Visual QA

実装後、UI ReferenceとのVisual差分を確認する。

確認対象：

```text
Layout
Spacing
Color
Typography
Image
Animation
Responsive
```

---

# 225. UI Reference更新

UI Designを変更した場合、必要に応じてUI Referenceも更新する。

---

# 226. UI Guideline更新

Visual Ruleが変更された場合、本書も更新する。

---

# 227. Design Decision

Designに大きな変更を加える場合、

```text
development-log.md
```

へDecisionを記録する。

---

# 228. Design Change Flow

```text
Design Change
 ↓
UI Reference
 ↓
UI Guideline
 ↓
Component Design
 ↓
Implementation
 ↓
Visual QA
```

---

# 229. UI Implementation Flow

基本的なUI実装順序：

```text
UI Reference確認
 ↓
Layout
 ↓
Design Token
 ↓
Primitive UI
 ↓
Feature Component
 ↓
Page
 ↓
Responsive
 ↓
Animation
 ↓
Accessibility
 ↓
Visual QA
```

---

# 230. Do / Don't

## Do

- Dark Themeを基本とする
- Accent Colorを効果的に使用する
- Subtle Glowを使用する
- Whitespaceを確保する
- Componentを統一する
- Responsive Designにする
- Accessibilityを考慮する
- Animationを目的を持って使用する

---

# 231. Don't

- Accent Colorを使いすぎる
- Glowを強くしすぎる
- Glass Effectを使いすぎる
- Animationを使いすぎる
- Textを小さくしすぎる
- Contrastを下げすぎる
- Mobileを後回しにする
- Pageごとに別のButton Designを作る

---

# 232. UI Quality Checklist

### Visual

- [ ] Color統一
- [ ] Typography統一
- [ ] Spacing統一
- [ ] Radius統一
- [ ] Border統一
- [ ] Shadow統一
- [ ] Glow統一

### Interaction

- [ ] Hover
- [ ] Focus
- [ ] Active
- [ ] Disabled
- [ ] Loading
- [ ] Error

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

### Performance

- [ ] Animation Performance
- [ ] Image Performance
- [ ] Initial Load
- [ ] Mobile Performance

---

# 233. Final Design Principles

ColorFitのUIでは以下を最重要原則とする。

```text
近未来的だが使いやすい
派手だが見づらくしない
高機能だが複雑にしない
Animationを使うが操作を邪魔しない
Dark UIだがContrastを犠牲にしない
```

---

# 234. 完了条件

UI Guidelineは以下を満たすことを完了条件とする。

- [ ] Design Conceptが定義されている
- [ ] Visual Directionが定義されている
- [ ] Color Systemが定義されている
- [ ] Background Colorが定義されている
- [ ] Surface Colorが定義されている
- [ ] Accent Colorが定義されている
- [ ] Semantic Colorが定義されている
- [ ] Text Colorが定義されている
- [ ] Glowが定義されている
- [ ] Glass Effectが定義されている
- [ ] Borderが定義されている
- [ ] Radiusが定義されている
- [ ] Spacingが定義されている
- [ ] Typographyが定義されている
- [ ] Buttonが定義されている
- [ ] Inputが定義されている
- [ ] Sliderが定義されている
- [ ] Cardが定義されている
- [ ] Headerが定義されている
- [ ] Heroが定義されている
- [ ] Result UIが定義されている
- [ ] Settings UIが定義されている
- [ ] Loading UIが定義されている
- [ ] Error UIが定義されている
- [ ] Empty Stateが定義されている
- [ ] Responsive Designが定義されている
- [ ] Accessibilityが定義されている
- [ ] Animationが定義されている
- [ ] GSAPの利用方針が定義されている
- [ ] Tailwind CSSの利用方針が定義されている
- [ ] Design Tokenが定義されている
- [ ] UI Referenceとの関係が定義されている
- [ ] Visual QAの方針が定義されている
- [ ] Design Changeの管理方法が定義されている
