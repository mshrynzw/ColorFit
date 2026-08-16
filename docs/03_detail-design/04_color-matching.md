# ColorFit カラーマッチング詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおけるカラーマッチング機能の詳細設計を定義する。

ColorFitは、ユーザーが指定したWebデザインの配色と配色比率を基準として、入力画像の色合いをWebデザインに調和するように調整する。

本書では、以下を定義する。

- Webデザイン配色の扱い
- 配色比率の扱い
- 入力画像の色解析
- 色空間
- 色距離
- 色の対応付け
- 目標色の算出
- 調整強度
- 色変換
- 自然さを維持するための制御
- 自動調整アルゴリズム
- 手動調整との関係
- 品質評価
- テスト方針

画像の読み込み、ファイル検証、画像形式、Pillow / NumPyの利用などは、

`03_detail-design/03_image-processing.md`

で定義する。

APIのRequest / Response仕様は、

`06_api.md`

で定義する。

---

# 2. Color Matchingの目的

ColorFitのカラーマッチング機能の目的は、

> Webデザインの配色に合わせて画像全体の色調を調整し、Webページ上で統一感のあるビジュアルを作ること

である。

単純に画像全体へ同じ色のフィルターを適用するのではなく、

```text
Webデザインの配色
        ↓
Primary / Secondary / Accent
        ↓
配色比率
        ↓
画像の色分布
        ↓
色の対応関係を算出
        ↓
各色を適切な方向へ調整
        ↓
自然な画像を生成
```

という処理を基本とする。

---

# 3. Color Matchingの基本思想

ColorFitでは、以下の考え方を基本とする。

```text
「画像をWebデザインの色で塗る」
```

のではなく、

```text
「画像の持っている色の関係性を維持しながら、
 Webデザインの色調へ寄せる」
```

ことを目指す。

例えば、

```text
元画像

青系 50%
白系 30%
グレー系 20%
```

に対して、

```text
Webデザイン

Primary   60%
Secondary 30%
Accent    10%
```

が指定された場合、単純な一括Tintではなく、画像内の色の分布を解析して適切な色へ変換する。

---

# 4. 入力データ

Color Matchingへの基本入力は以下とする。

```text
Input Image
Palette
Palette Ratio
Adjustment Strength
```

概念：

```text
┌──────────────────┐
│   Input Image    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Image Analysis  │
└────────┬─────────┘
         │
         │
┌────────┴─────────┐
│                  │
↓                  ↓
Palette        Palette Ratio
│                  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Color Matching   │
└────────┬─────────┘
         ↓
   Adjustment Data
```

---

# 5. Webデザイン配色

MVPではWebデザインの配色として以下の3色を扱う。

```text
Primary
Secondary
Accent
```

例：

```text
Primary   #1B263B
Secondary #415A77
Accent    #E0A458
```

各色はHEX形式で入力される。

BackendではHEX値をRGBなどの内部表現へ変換する。

---

# 6. 配色比率

各カラーには使用割合を設定する。

```text
Primary   60%
Secondary 30%
Accent    10%
```

合計：

```text
60 + 30 + 10 = 100
```

となることを基本とする。

---

# 7. 配色比率の意味

配色比率は、単純に画像のピクセル数をその割合へ強制的に変更するための値ではない。

配色比率は、

> Webデザインにおいて各色が持つ視覚的な重要度

として扱う。

したがって、

```text
Primary 60%
```

だからといって、出力画像の60%をPrimary色へ変換することを意味しない。

---

# 8. 配色比率の利用

配色比率はColor Matchingにおける重みとして利用する。

概念：

```text
Primary
60%
 ↓
強い影響

Secondary
30%
 ↓
中程度の影響

Accent
10%
 ↓
限定的な影響
```

この重みを画像内の色の変換方向や変換強度の算出に利用する。

---

# 9. 入力画像の色解析

Color Matchingの前に画像の色分布を解析する。

基本的な解析項目：

- 平均色
- 主要カラー
- 色の分布
- 明度
- 彩度
- 色相
- 色ごとの占有率

---

# 10. 主要カラー抽出

画像から代表的なカラーを抽出する。

概念：

```text
Input Image
    ↓
Sampling
    ↓
Color Quantization / Clustering
    ↓
Representative Colors
```

例えば、

```text
Color A  45%
Color B  25%
Color C  15%
Color D  10%
Color E   5%
```

のような結果を得る。

---

# 11. 色クラスタ

画像の各ピクセルをそのまま比較するのではなく、似た色をまとめてクラスタとして扱う。

```text
大量のPixel
      ↓
Color Clustering
      ↓
Color Cluster
      ↓
Representative Color
```

これにより、画像全体の色構造を扱いやすくする。

---

# 12. 色クラスタの情報

各Color Clusterは概念的に以下の情報を持つ。

```text
ColorCluster
├── color
├── ratio
├── brightness
├── saturation
└── weight
```

例：

```text
Cluster A
color: #D8E6F2
ratio: 42%

Cluster B
color: #354B5E
ratio: 28%

Cluster C
color: #A67C52
ratio: 18%

Cluster D
color: #F2F2F2
ratio: 12%
```

---

# 13. 色空間

Color Matchingでは用途に応じて色空間を使い分ける。

基本方針：

```text
RGB
↓
画像データの基本表現

HSV / HSL
↓
色相・彩度・明度の調整

Lab / LCh
↓
色距離・知覚的な色比較
```

---

# 14. RGB

RGBは画像データの基本表現として使用する。

```text
R
G
B
```

の3チャンネルで表現する。

ただし、RGB上の単純なユークリッド距離は、人間が感じる色の違いを正確に表現できないため、Color Matchingの色距離計算には原則としてRGB距離を直接使用しない。

---

# 15. HSV / HSL

HSVまたはHSLは、色調整に利用する。

主な用途：

```text
Hue
Saturation
Brightness / Lightness
```

例えば、

```text
青
 ↓
青紫
```

のような色相変化を扱いやすい。

---

# 16. Lab / LCh

色の近さを評価する場合には、Lab系色空間の利用を基本候補とする。

Lab：

```text
L*
a*
b*
```

LCh：

```text
L*
C*
h°
```

LChでは、

- 明度
- 彩度
- 色相

という人間が理解しやすい要素として扱える。

---

# 17. 色距離

Color Matchingでは、画像内の色とWebデザインの色がどれだけ近いかを計算する。

概念：

```text
Image Color
     ↓
Color Distance
     ↓
Design Color
```

色距離が小さいほど、色が近いと判断する。

---

# 18. 色距離アルゴリズム

MVPでは、知覚的な色差を考慮できる方式を採用する。

候補：

```text
CIE76
CIEDE2000
```

基本的にはCIEDE2000の採用を優先的に検討する。

理由：

- 人間の色知覚を考慮できる
- 単純なRGB距離より色差評価に適している
- Color Matchingの目的と相性が良い

ただし、実装コストと処理速度を検証したうえで最終決定する。

---

# 19. 色距離の正規化

Color Distanceはそのまま使用するのではなく、Color Matchingで扱いやすい値へ正規化する。

概念：

```text
Color Distance
      ↓
Normalization
      ↓
Similarity
```

例えば、

```text
距離が小さい
↓
Similarityが高い

距離が大きい
↓
Similarityが低い
```

とする。

---

# 20. Color Similarity

色の類似度を概念的に、

```text
Similarity = f(Color Distance)
```

として算出する。

Similarityは、

```text
0.0 ～ 1.0
```

などの正規化された値として扱う。

---

# 21. 色の対応付け

画像のColor ClusterとWebデザインPaletteを対応付ける。

例えば、

```text
Image Cluster
A
B
C
D

Palette
Primary
Secondary
Accent
```

に対して、

```text
A → Primary
B → Secondary
C → Primary
D → Accent
```

のような対応を算出する。

---

# 22. 対応付けの基本ルール

対応付けでは以下を考慮する。

- 色距離
- 明度
- 彩度
- 色相
- 配色比率
- Clusterの占有率
- Accentの重要度

単純に最も近い色へ対応させるだけではなく、Webデザイン全体の配色バランスを考慮する。

---

# 23. Primary Color

PrimaryはWebデザインの基準となる色として扱う。

画像変換では比較的大きな影響力を持つ。

例えば、

```text
Primary = 60%
```

の場合、画像全体の色調をPrimary方向へ寄せる影響を強くする。

---

# 24. Secondary Color

SecondaryはPrimaryを補助する色として扱う。

Primaryほど強くは影響させないが、画像内の複数の色領域へ適用する。

---

# 25. Accent Color

AccentはWebデザイン上のアクセントとして扱う。

Accentは配色比率が低い場合が多いため、画像全体へ強く適用しない。

基本的には、

```text
Accent
↓
限定的な色領域
```

へ適用することを優先する。

---

# 26. Accentの扱い

Accent Colorを画像全体へ適用すると、画像が不自然になる可能性が高い。

そのため、

```text
Accent Ratio = 10%
```

の場合でも、

```text
画像の10%をAccentにする
```

とはしない。

Accentは、

- 既に彩度が高い領域
- Accentに近い色
- 視覚的に目立つ領域

などへ優先的に適用する。

---

# 27. 配色比率と色クラスタ比率

画像のColor Cluster比率とWebデザインのPalette Ratioは異なる概念として扱う。

```text
Image Ratio
↓
現在の画像の色分布

Palette Ratio
↓
Webデザイン上の色の重要度
```

両者を直接一致させるのではなく、Color Matchingの重みとして利用する。

---

# 28. 色変換の基本モデル

各Color Clusterについて、

```text
Original Color
       ↓
Target Color
       ↓
Adjustment
       ↓
Transformed Color
```

を算出する。

基本的には、

```text
Transformed
=
Original + Adjustment × Strength
```

という考え方をベースにする。

ただし、RGB空間で単純加算するのではなく、適切な色空間上で処理する。

---

# 29. Adjustment Vector

色変換はAdjustment Vectorとして扱うことができる。

概念：

```text
Original Color
      │
      │ Adjustment Vector
      ↓
Target Color
```

例えばLChを利用する場合、

```text
ΔL
ΔC
Δh
```

として表現できる。

---

# 30. 明度の扱い

Color Matchingでは色相だけでなく明度も考慮する。

例えば、

```text
暗い青
```

を

```text
明るい黄色
```

へ変換すると、色相だけ変更した場合に不自然になる可能性がある。

そのため、

```text
Hue
+
Chroma
+
Lightness
```

を総合的に考慮する。

---

# 31. 彩度の扱い

元画像の彩度を完全に無視してTarget Colorへ変換しない。

例えば、

```text
低彩度のグレー
```

を

```text
高彩度のAccent
```

へ直接変換すると不自然になりやすい。

そのため、Target Colorの彩度をそのまま適用するのではなく、元画像の彩度を考慮して補間する。

---

# 32. 色相の扱い

色相変換では、最短方向へのHue Shiftを基本候補とする。

Hueは循環値であるため、

```text
359°
→
1°
```

は大きな変化ではなく、

```text
-2°
```

程度の変化として扱う。

---

# 33. 色相の補間

色相を完全にTargetへ移動させるのではなく、補間する。

概念：

```text
Original Hue
      ↓
Interpolation
      ↓
Target Hue
```

調整強度が、

```text
0%
```

ならOriginalを維持する。

```text
100%
```

ならTargetへ最大限寄せる。

---

# 34. 色変換強度

最終的な変換量には複数のWeightを使用する。

概念：

```text
Transformation Strength
=
User Strength
×
Palette Weight
×
Color Similarity
×
Cluster Weight
×
Protection Weight
```

各Weightは0～1などの範囲へ正規化する。

---

# 35. User Strength

ユーザーが設定する調整強度。

```text
0%
↓
元画像を維持

50%
↓
中程度の調整

100%
↓
最大限の調整
```

---

# 36. Palette Weight

配色比率から算出するWeight。

例えば、

```text
Primary   60%
Secondary 30%
Accent    10%
```

の場合、

```text
Primary
→ 高Weight

Secondary
→ 中Weight

Accent
→ 低Weight
```

とする。

---

# 37. Similarity Weight

画像のColor ClusterとTarget Colorがどの程度関係しているかを表す。

近い色ほど高いWeightとする。

```text
Similarity
1.0
↑
│  Strong
│
0.5
│
│  Weak
0.0
```

---

# 38. Cluster Weight

Color Clusterの画像内占有率を考慮する。

例えば、

```text
Cluster A
60%

Cluster B
30%

Cluster C
10%
```

の場合、Cluster Aは画像全体への影響が大きい。

ただし、Cluster比率をそのまま変換強度へ利用すると、大きな領域ばかりが変換されるため、適切に正規化する。

---

# 39. Protection Weight

画像内の重要な色を過度に変更しないためのWeight。

概念：

```text
Protection Weight
1.0
↓
保護なし

0.0
↓
完全保護
```

必要に応じて、

- 肌色
- 白
- 黒
- 低彩度領域

などへ適用する。

---

# 40. 肌色保護

人物画像では肌色の変化を抑える。

肌色と推定される領域については、

```text
Transformation Strength
↓
低減
```

する。

ただし、MVPでは完全な人物認識を必須としない。

まずは色空間上の肌色領域推定による簡易保護を検討する。

---

# 41. 白色保護

白色に近い領域は、WebデザインのAccent Colorなどへ強く変換しない。

例えば、

```text
白背景
```

が、

```text
赤色
```

へ変化すると不自然になりやすい。

そのため、低彩度かつ高明度の領域については変換強度を抑える。

---

# 42. 黒色保護

黒色に近い領域も過度な色変換を避ける。

例えば、

```text
黒い文字
```

が、

```text
黄色
```

になると視覚的に不自然になる可能性がある。

低明度領域についても適切に保護する。

---

# 43. Neutral Color

以下のような低彩度領域をNeutral Colorとして扱う。

```text
白
グレー
黒
```

Neutral ColorはColor Matchingにおいて特殊な扱いをする。

特にWebデザインのPrimary Colorが高彩度であっても、すべてのNeutral ColorをPrimaryへ変換しない。

---

# 44. Neutral領域の変換

Neutral領域では、色相変更よりも、

- 明度
- コントラスト
- 色温度

などを優先する。

これにより、画像の自然さを維持する。

---

# 45. 色領域ごとの変換

Color Matchingでは画像全体を一括変換するのではなく、Color Clusterごとに異なる変換を適用する。

概念：

```text
Image
 ├── Cluster A → Primary
 ├── Cluster B → Secondary
 ├── Cluster C → Accent
 └── Neutral   → 保護
```

これがColorFitの基本的な考え方である。

---

# 46. グラデーションの維持

画像には連続的な色変化が存在する。

Color Cluster単位で完全に色を置換すると、

```text
Banding
```

が発生する可能性がある。

そのため、隣接する色が急激に変化しないよう、変換量を滑らかにする。

---

# 47. Smooth Transition

各Pixelの変換量を、

```text
0
～
1
```

の連続値として扱う。

概念：

```text
Protection
Similarity
Cluster Membership
        ↓
Transformation Weight
        ↓
Smooth Color Transform
```

これにより、色境界の急激な変化を防ぐ。

---

# 48. Soft Assignment

Pixelを1つのClusterへ完全に所属させるのではなく、複数Clusterへの所属度を持たせる方式を検討する。

例：

```text
Pixel A

Primary    0.7
Secondary  0.2
Accent     0.1
```

この方式により、色変換を滑らかにできる。

MVPでは処理負荷と品質を比較したうえで採用を決定する。

---

# 49. Hard Assignment

単純な実装では、各Color Clusterを最も近いPalette Colorへ割り当てる。

例：

```text
Cluster A → Primary
Cluster B → Secondary
Cluster C → Accent
```

実装が容易だが、境界が不自然になりやすい。

そのため、MVPではHard Assignmentをベースラインとして実装し、必要に応じてSoft Assignmentへ発展させる。

---

# 50. MVPアルゴリズム

MVPでは、以下の段階的なアルゴリズムを基本とする。

```text
1. 画像を解析
      ↓
2. 主要カラーを抽出
      ↓
3. 各主要カラーの比率を算出
      ↓
4. PaletteをLab/LCh等へ変換
      ↓
5. 画像カラーとPaletteの色距離を計算
      ↓
6. Color ClusterとPaletteを対応付け
      ↓
7. 配色比率からWeightを算出
      ↓
8. Target Colorを決定
      ↓
9. Adjustment Strengthを計算
      ↓
10. 色を補間
      ↓
11. Neutral / Skinなどを保護
      ↓
12. 画像へ変換を適用
      ↓
13. 出力画像を生成
```

---

# 51. Target Colorの決定

各Color Clusterについて、Target Colorを決定する。

概念：

```text
Cluster Color
      +
Palette
      +
Palette Ratio
      ↓
Target Color
```

Target Colorは必ずしもPalette Colorそのものではない。

---

# 52. 中間色

例えば、

```text
Original
#7A8A90

Target
#1B263B
```

の場合、いきなりTargetへ変換するのではなく、中間色を算出する。

```text
Original
  ↓
Intermediate
  ↓
Target
```

この補間によって自然な変化を実現する。

---

# 53. Target Colorの補間

基本概念：

```text
ResultColor
=
OriginalColor × (1 - Strength)
+
TargetColor × Strength
```

ただし、実際の計算は適切な色空間上で行う。

RGB直接補間では色が濁るケースがあるため、LCh等での補間を優先的に検討する。

---

# 54. LChでの補間

LChを利用する場合：

```text
L
C
h
```

それぞれを補間する。

ただしHueは循環値であるため、単純な平均を取らない。

---

# 55. Hue補間

Hueは最短経路で補間する。

例：

```text
350°
↓
10°
```

の場合、

```text
360°を跨いで
20°程度の変化
```

として扱う。

---

# 56. Chroma補間

Chromaは元画像とTargetの中間値を使用する。

ただしTargetのChromaが極端に高い場合、元画像の自然さを維持するために制限する場合がある。

---

# 57. Lightness補間

Lightnessは元画像の明暗構造をできるだけ維持する。

ColorFitでは、色を合わせることが目的であり、画像の立体感を破壊することは目的ではない。

そのため、L値の変化量はHueやChromaより慎重に扱う。

---

# 58. コントラスト維持

Color Matchingによって画像のコントラストが失われないようにする。

例えば、

```text
Shadow
Midtone
Highlight
```

の関係性をできるだけ維持する。

---

# 59. 明暗構造の保持

元画像の相対的な明暗関係を維持する。

概念：

```text
Dark
  ↓
Dark

Mid
  ↓
Mid

Bright
  ↓
Bright
```

色調整によって全体が同じ明度になることを避ける。

---

# 60. 自然さWeight

最終的な変換量には自然さを考慮する。

概念：

```text
Final Strength
=
Matching Strength
×
Naturalness Weight
```

Naturalness Weightは、

- 極端な色差
- 極端な彩度
- 極端な明度変化
- Neutral領域
- 肌色領域

などを考慮して算出する。

---

# 61. 極端な色差への対応

Original ColorとTarget Colorが大きく異なる場合、100%の変換を適用すると不自然になる可能性が高い。

そのため、色距離が大きいほど変換強度を緩和する方式を検討する。

```text
Color Distance
小
↓
強く合わせる

Color Distance
大
↓
慎重に合わせる
```

---

# 62. Accentの過剰適用防止

Accent Colorは視覚的に目立つため、過剰適用を防止する。

Accentへの変換対象は、

- 元々彩度が高い
- Accentに近い
- 画像内で視覚的に強い

などの領域を優先する。

---

# 63. Palette Ratioの正規化

Palette RatioはそのままWeightとして使用せず、必要に応じて正規化する。

例えば、

```text
Primary   80%
Secondary 10%
Accent    10%
```

の場合、Primaryがすべてを支配しすぎないようWeightを調整することがある。

---

# 64. Palette Dominance

Palette Ratioが極端な場合でも、SecondaryやAccentが完全に無視されないようにする。

概念：

```text
Raw Ratio
    ↓
Weight Function
    ↓
Balanced Weight
```

具体的なWeight Functionは実験結果をもとに決定する。

---

# 65. ColorFit Strength

ユーザーが設定するColorFit Strengthを最終的な調整強度へ反映する。

基本：

```text
FinalStrength
=
CalculatedStrength
×
UserStrength
```

UserStrength：

```text
0.0 ～ 1.0
```

を基本とする。

---

# 66. Strength = 0

Strengthが0の場合、入力画像と出力画像の色を可能な限り同一にする。

```text
Strength = 0
↓
No Color Matching
```

画像形式変換などによる差異は別途考慮する。

---

# 67. Strength = 1

Strengthが1の場合、Color Matchingで算出したTargetへ最大限寄せる。

ただし、

```text
Naturalness
Protection
Safety Limit
```

などによって実際の変換量を制限する場合がある。

---

# 68. 色変換後のClamping

変換後の値が不正な範囲にならないようにする。

```text
L
C
RGB
```

など各色空間に応じて適切な範囲へ制限する。

---

# 69. 色域外への対応

Target Colorが変換後の色域外になる場合がある。

その場合は、出力可能な範囲へ適切にマッピングする。

単純にRGB値をClampするだけでは色相や彩度が大きく変化する場合があるため、必要に応じてChromaを下げるなどの処理を行う。

---

# 70. 色域マッピング

概念：

```text
Target Color
      ↓
Out of Gamut?
      ↓
Yes
      ↓
Reduce Chroma
      ↓
Valid Color
```

これにより極端な色変化を抑える。

---

# 71. 黒・白の扱い

Black / Whiteは特殊色として扱う。

```text
Black
↓
明度構造を維持

White
↓
明度構造を維持
```

PrimaryやAccentへの直接置換は基本的に避ける。

---

# 72. グレーの扱い

低彩度のグレーはNeutral領域として扱う。

必要に応じて、

```text
Neutral
↓
Paletteの色温度方向
```

へ少しだけ寄せる。

---

# 73. 画像全体の色調

Color Matching後に画像全体の色調を評価する。

評価項目：

- 平均色
- 主要カラー
- 色相分布
- 彩度分布
- 明度分布

これにより、変換結果がPaletteから大きく外れていないか確認する。

---

# 74. Post Processing

Color Matching後に必要に応じてPost Processingを行う。

候補：

```text
Saturation Limiting
Contrast Correction
Highlight Protection
Shadow Protection
Color Gamut Mapping
```

ただし、Post ProcessingによってColor Matching結果を過剰に変更しない。

---

# 75. 自動調整結果の評価

自動調整後、以下を評価する。

```text
Palette Similarity
+
Image Naturalness
+
Contrast Preservation
+
Color Diversity
```

これらを総合して最終結果を決定する。

---

# 76. Quality Score

ColorFit内部で結果を評価するためのQuality Scoreを将来的に導入できる。

概念：

```text
Quality Score
=
Palette Match Score
+
Naturalness Score
+
Contrast Score
+
Protection Score
```

MVPでは内部デバッグ用として利用し、ユーザーへ直接表示する必要はない。

---

# 77. Color Match Score

Paletteとの一致度を評価する。

```text
Input Image
↓
Color Distribution
↓
Palette
↓
Similarity
```

高いほどWebデザインの配色に近いと判断する。

---

# 78. Naturalness Score

画像が不自然になっていないかを評価する。

例えば、

- 肌色の異常
- 彩度過多
- 明度過多
- 色域外
- 色の急変

などを考慮する。

---

# 79. Contrast Score

元画像の明暗構造が維持されているかを評価する。

```text
Original Contrast
       ↓
Processed Contrast
       ↓
Difference
```

差が大きすぎる場合、調整強度を下げることを検討する。

---

# 80. 自動調整の最終決定

最終的な変換結果は、

```text
Color Matching
+
Naturalness
+
Protection
+
User Strength
```

を考慮して決定する。

---

# 81. 基本アルゴリズム擬似コード

概念的なアルゴリズム：

```python
def color_match(image, palette, palette_ratio, strength):

    clusters = analyze_colors(image)

    targets = []

    for cluster in clusters:

        similarities = calculate_similarity(
            cluster.color,
            palette
        )

        target = select_target_color(
            cluster,
            palette,
            palette_ratio,
            similarities
        )

        transform_strength = calculate_strength(
            cluster,
            target,
            palette_ratio,
            strength
        )

        targets.append(
            create_color_transform(
                cluster,
                target,
                transform_strength
            )
        )

    result = apply_color_transforms(
        image,
        targets
    )

    result = apply_protection(
        result,
        image
    )

    result = apply_gamut_mapping(
        result
    )

    return result
```

これはアルゴリズムの概念を示すものであり、実際の実装コードではない。

---

# 82. 処理パイプライン

最終的なColor Matching Pipeline：

```text
Input Image
     ↓
Image Analysis
     ↓
Color Clustering
     ↓
Palette Normalization
     ↓
Color Distance Calculation
     ↓
Color Assignment
     ↓
Target Color Calculation
     ↓
Transformation Strength
     ↓
Color Interpolation
     ↓
Naturalness Protection
     ↓
Gamut Mapping
     ↓
Post Processing
     ↓
Output Image
```

---

# 83. 処理の決定順序

処理の優先順位は以下とする。

```text
1. 元画像の自然さ
2. 画像の明暗構造
3. Webデザインとの色調整和
4. Palette Ratio
5. Accent Color
```

ColorFitは「完全一致」よりも「自然な調和」を優先する。

---

# 84. 自然さを優先する理由

画像のすべての色をWebデザインへ完全に合わせると、

```text
肌色
白
黒
商品色
自然物
```

などが不自然になる可能性がある。

そのため、

```text
100% Match
```

より、

```text
Natural Match
```

を目標とする。

---

# 85. 具体例

Webデザイン：

```text
Primary   #152238
Secondary #3A506B
Accent    #E0A458

Ratio

Primary   60%
Secondary 30%
Accent    10%
```

入力画像：

```text
Blue       45%
Gray       25%
White      20%
Brown      10%
```

ColorFitは、

```text
Blue
↓
Primary / Secondary

Gray
↓
Secondary / Neutral

White
↓
基本的に維持

Brown
↓
Accent方向へ一部調整
```

のような変換を検討する。

---

# 86. Accentの具体例

Accent：

```text
#E0A458
```

が指定されていても、

```text
白い背景
```

を

```text
#E0A458
```

へ変換することは避ける。

一方、

```text
元々オレンジ色の小物
```

などはAccent方向へ調整する候補となる。

---

# 87. Webデザインとの調和

ColorFitの最終目的は、

```text
画像単体で美しい
```

だけではない。

以下の状態を目指す。

```text
Web Design
 ├── Background
 ├── Typography
 ├── Buttons
 ├── UI Elements
 └── Image
          ↓
       Color Harmony
```

画像がWebページ全体の配色と調和することを重視する。

---

# 88. Manual Adjustmentとの関係

Auto Color Matching後、ユーザーは手動調整を行える。

```text
Auto Matching
      ↓
Result
      ↓
Manual Adjustment
      ↓
Final Result
```

Manual Adjustmentでは、

- Temperature
- Saturation
- Brightness
- Contrast
- Hue

などを調整できる。

---

# 89. Manual Adjustmentの優先

ユーザーが手動で調整した値は、自動調整より優先する。

つまり、

```text
Auto Result
+
User Adjustment
=
Final Result
```

とする。

---

# 90. 再マッチング

ユーザーがPaletteを変更した場合、Color Matchingを再実行できる。

```text
Palette変更
 ↓
Image Analysis
 ↓
Color Matching
 ↓
New Result
```

ただし、画像解析結果を再利用できる場合は再解析を省略する。

---

# 91. キャッシュ

画像解析結果は、同じ画像に対して再利用できる可能性がある。

概念：

```text
Image
 ↓
Analysis
 ↓
Cache
```

Paletteだけ変更した場合：

```text
Cached Analysis
+
New Palette
↓
Color Matching
```

とすることで処理時間を短縮できる。

---

# 92. Analysis Cache

Analysis Cacheには以下を保存できる。

```text
imageHash
width
height
dominantColors
colorDistribution
brightnessDistribution
saturationDistribution
```

MVPでは必須ではなく、性能測定後に導入を判断する。

---

# 93. Deterministic Processing

同一条件では可能な限り同じ結果を返す。

```text
Same Image
+
Same Palette
+
Same Ratio
+
Same Strength
=
Same Result
```

ランダムなクラスタリングなどを使用する場合はSeedを固定するなど、再現性を確保する。

---

# 94. パフォーマンス

Color Matchingは全ピクセルに対する処理となる可能性があるため、性能を考慮する。

基本方針：

- 解析は縮小画像
- NumPyによるベクトル化
- 不要なコピーを避ける
- 色クラスタ数を制限
- 同じ画像の解析結果を再利用
- 高解像度画像では処理量を制限

---

# 95. Color Cluster数

Cluster数を増やすほど色の表現力は向上するが、処理コストも増加する。

MVPでは少数の代表色から開始し、品質と速度を測定する。

具体的なCluster数はベンチマーク結果をもとに決定する。

---

# 96. 解析解像度

Color Matching用の解析画像は、元画像を必要以上に高解像度のまま処理しない。

例えば、

```text
Original
4000 × 3000

↓

Analysis
1024 × 768程度
```

のように縮小して解析する方式を検討する。

最終値はベンチマークで決定する。

---

# 97. 画像品質と処理速度

ColorFitでは、

```text
Accuracy
vs
Performance
```

のバランスを取る。

MVPでは、

```text
「多少の誤差があっても高速」
```

よりも、

```text
「Webデザインとして自然に見える」
```

ことを優先する。

ただし、ユーザーが待てないほど遅い処理は避ける。

---

# 98. テスト画像

Color Matchingのテストには以下の画像を使用する。

```text
01_landscape.jpg
02_portrait.jpg
03_product.jpg
04_illustration.png
05_night.jpg
06_bright.jpg
07_dark.jpg
08_high_saturation.jpg
09_low_saturation.jpg
10_transparent.png
```

---

# 99. テストケース

最低限、以下を確認する。

### Case 1

```text
低彩度画像
+
高彩度Palette
```

期待：

過剰な彩度にならず、自然にPalette方向へ寄る。

---

### Case 2

```text
人物画像
+
暖色Palette
```

期待：

肌色が不自然に変化しない。

---

### Case 3

```text
白背景画像
+
Accent Color
```

期待：

白背景がAccent Colorへ過剰に変化しない。

---

### Case 4

```text
暗い画像
+
明るいPalette
```

期待：

暗部の明暗構造を維持しながら色調を調整する。

---

### Case 5

```text
高彩度画像
+
高彩度Palette
```

期待：

色飽和や不自然な色域外を抑える。

---

# 100. Regression Test

Color Matchingアルゴリズムを変更した場合、既存テスト画像で結果を再確認する。

確認項目：

```text
処理成功
色調
肌色
明暗
彩度
Contrast
Alpha
処理時間
```

---

# 101. Human Evaluation

Color Matchingは数値評価だけでは不十分である。

そのため、最終的には人間によるVisual Evaluationを行う。

評価項目：

```text
1. Webデザインとの調和
2. 元画像の自然さ
3. 肌色の自然さ
4. 色の美しさ
5. コントラスト
6. Accentの扱い
```

---

# 102. A/B比較

アルゴリズム改善時には、

```text
Version A
vs
Version B
```

で比較する。

例えば、

```text
単純Hue Shift
vs
Color Cluster Matching
```

を比較し、ColorFitとしてどちらが自然か確認する。

---

# 103. ベースライン

MVP開発初期では、比較対象として以下の単純方式を実装してもよい。

```text
Global Tint
```

つまり画像全体へWebデザインのPrimary Colorを薄く適用する。

これをBaselineとして、

```text
Baseline
vs
Color Matching
```

を比較する。

---

# 104. アルゴリズム改善方針

Color Matchingは最初から複雑なアルゴリズムを完成させるのではなく、段階的に改善する。

```text
Phase 1
Global Color Adjustment
        ↓
Phase 2
Dominant Color Matching
        ↓
Phase 3
Color Cluster Matching
        ↓
Phase 4
Protection
        ↓
Phase 5
Soft Assignment
        ↓
Phase 6
Advanced Color Matching
```

---

# 105. Phase 1

最初は単純な色調整を実装する。

目的：

- APIとの接続確認
- Pillow / NumPyの動作確認
- 画像処理パイプライン確認
- UIとの統合確認

---

# 106. Phase 2

Dominant Colorを利用したColor Matchingを実装する。

```text
Image
↓
Dominant Colors
↓
Palette
↓
Color Distance
↓
Target Color
```

---

# 107. Phase 3

複数のColor Clusterを利用する。

```text
Image
├── Cluster A
├── Cluster B
├── Cluster C
├── Cluster D
└── Cluster E
```

それぞれを個別にPaletteへ対応付ける。

---

# 108. Phase 4

Naturalness Protectionを導入する。

対象：

```text
Skin
White
Black
Neutral
```

---

# 109. Phase 5

Soft Assignmentを導入する。

1つの色を完全に1つのTargetへ変換するのではなく、

```text
Primary 70%
Secondary 20%
Accent 10%
```

のような複数Weightを使用する。

---

# 110. Phase 6

必要に応じて、

- より高度なColor Distance
- 色域マッピング
- 領域認識
- 人物領域保護
- オブジェクト単位のColor Matching

などへ拡張する。

---

# 111. アルゴリズムの責務

Color Matching Moduleは以下を担当する。

```text
Palette Analysis
Color Similarity
Color Assignment
Target Color Calculation
Transformation Strength Calculation
Protection Weight
```

以下は担当しない。

```text
Image Upload
File Validation
Storage
HTTP Response
Image Encoding
```

---

# 112. Module構成

Backendでは以下のような構成を基本とする。

```text
image_processing/
├── analyzer.py
├── matcher.py
├── transformer.py
└── presets.py
```

Color Matchingの主要ロジックは、

```text
matcher.py
```

を中心に実装する。

---

# 113. `analyzer.py`

担当：

```text
画像解析
主要カラー抽出
色分布
明度分布
彩度分布
```

---

# 114. `matcher.py`

担当：

```text
Palette
+
Image Analysis
↓
Color Matching
↓
Target Colors
↓
Adjustment
```

ColorFitのコアロジックを配置する。

---

# 115. `transformer.py`

担当：

```text
Original Image
+
Color Transform
↓
Processed Image
```

実際のピクセル変換を担当する。

---

# 116. Preset

Presetは以下を基本とする。

```text
Natural
Cool
Warm
Chic
Soft
```

PresetはColor Matchingそのものではなく、初期Adjustment値として扱う。

---

# 117. エラー処理

Color Matchingで発生する可能性のあるエラー：

```text
INVALID_PALETTE
INVALID_RATIO
COLOR_ANALYSIS_FAILED
COLOR_MATCHING_FAILED
COLOR_TRANSFORM_FAILED
OUT_OF_GAMUT
```

---

# 118. 異常入力

以下のような入力は処理前に拒否する。

```text
Paletteが不正
Ratio合計が100ではない
Strengthが範囲外
Palette Colorが不正
```

---

# 119. 数値範囲

AdjustmentやWeightなどの内部値について、可能な限り明確な範囲を定義する。

例：

```text
Strength
0.0 ～ 1.0

Ratio
0 ～ 100

Similarity
0.0 ～ 1.0
```

---

# 120. 再現性

同じ入力に対して、可能な限り同じ出力が生成されることを保証する。

アルゴリズム変更時には、意図しない結果変更が発生していないかRegression Testで確認する。

---

# 121. セキュリティ

Color Matching自体ではユーザー入力を信用しない。

特に、

```text
Palette
Ratio
Strength
```

はBackend側でも検証する。

---

# 122. パフォーマンス測定

以下の処理時間を測定する。

```text
Image Analysis
Color Clustering
Color Distance
Target Calculation
Transformation
```

これによりボトルネックを特定する。

---

# 123. 品質と速度のトレードオフ

Color Matchingでは以下を比較する。

```text
Cluster数
解析画像サイズ
Color Distance Algorithm
Transformation方式
```

例えば、

```text
CIE76
vs
CIEDE2000
```

などを比較し、品質と速度のバランスを決定する。

---

# 124. MVPの最終目標

MVPでは、以下の状態を目標とする。

```text
ユーザー
 ↓
Webデザインの色を入力
 ↓
配色比率を入力
 ↓
画像をアップロード
 ↓
ColorFit
 ↓
画像の色を解析
 ↓
Webデザインとの色差を計算
 ↓
画像内の主要カラーを調整
 ↓
自然さを維持
 ↓
Before / After
 ↓
結果を確認
 ↓
画像を書き出し
```

---

# 125. ColorFitのコアコンセプト

ColorFitのColor Matchingは、

```text
「指定された色に画像を染める」
```

機能ではない。

目標は、

```text
「Webデザインのカラーパレットを理解し、
画像の持つ色構造を維持しながら、
Webデザインと調和する色へ変換する」
```

ことである。

---

# 126. 実装原則

Color Matching実装では以下を原則とする。

1. 単純なGlobal Tintだけに依存しない。
2. 画像の色分布を解析する。
3. Palette RatioをWeightとして利用する。
4. RGB距離だけで色を判断しない。
5. 色距離には知覚的な色差を考慮する。
6. Color Cluster単位で変換を検討する。
7. 色相だけでなく明度・彩度も考慮する。
8. 元画像の明暗構造を可能な限り維持する。
9. 白・黒・Neutral領域を過剰に変更しない。
10. 人物画像では肌色の変化を抑える。
11. Accent Colorを画像全体へ過剰適用しない。
12. 色域外の色を適切に処理する。
13. User Strengthを最終的な変換強度へ反映する。
14. Auto AdjustmentとManual Adjustmentを分離する。
15. 同じ入力に対して再現性のある結果を生成する。
16. Color MatchingとImage Processingを分離する。
17. 品質だけでなく処理時間も評価する。
18. アルゴリズム変更時にはRegression Testを実施する。
19. 数値評価だけでなくVisual Evaluationを行う。
20. 完全一致よりも自然な色調和を優先する。

---

# 127. 完了条件

Color Matching詳細設計は以下を満たすことを完了条件とする。

- [ ] Color Matchingの目的が定義されている
- [ ] Paletteの扱いが定義されている
- [ ] Palette Ratioの扱いが定義されている
- [ ] Image Color Analysisが定義されている
- [ ] Color Clusterの概念が定義されている
- [ ] 色空間の役割が定義されている
- [ ] 色距離の方針が定義されている
- [ ] Color Similarityが定義されている
- [ ] Color Assignmentが定義されている
- [ ] Target Colorの算出方針が定義されている
- [ ] Adjustment Strengthが定義されている
- [ ] Primary / Secondary / Accentの扱いが定義されている
- [ ] Neutral Colorの扱いが定義されている
- [ ] 白・黒の保護方針が定義されている
- [ ] 肌色保護の方針が定義されている
- [ ] 色域外への対応方針が定義されている
- [ ] 明暗構造の保持方針が定義されている
- [ ] Auto Adjustmentが定義されている
- [ ] Manual Adjustmentとの関係が定義されている
- [ ] MVPアルゴリズムが定義されている
- [ ] アルゴリズムの段階的な発展方針が定義されている
- [ ] パフォーマンス方針が定義されている
- [ ] テスト方針が定義されている
- [ ] Visual Evaluation方針が定義されている
- [ ] Image Processingとの責務境界が明確になっている
