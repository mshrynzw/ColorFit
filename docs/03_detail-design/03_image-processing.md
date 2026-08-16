# ColorFit 画像処理詳細設計書

## 1. 文書概要

### 1.1 目的

本書は、ColorFitにおける画像処理機能の詳細設計を定義する。

`product.md`、`01_requirements.md`、`02_basic-design.md`、
`03_detail-design/01_frontend.md`、
`03_detail-design/02_backend.md`

で定義された要件および基本設計をもとに、画像のアップロード、検証、読み込み、解析、変換、出力、Storageへの保存など、画像処理に関する具体的な仕様を定義する。

本書では、画像処理基盤そのものを定義する。

Webデザインの配色を画像へどのように適用するかというColorFit独自のカラーマッチングアルゴリズムについては、

`03_detail-design/04_color-matching.md`

で定義する。

---

# 2. 画像処理の基本方針

ColorFitでは、画像処理の主要な処理をBackendで実行する。

基本的な処理フロー：

```text
画像アップロード
      ↓
ファイル検証
      ↓
画像デコード
      ↓
画像情報取得
      ↓
画像解析
      ↓
カラー処理
      ↓
画像変換
      ↓
出力画像生成
      ↓
Storage保存
      ↓
Frontendへ結果を返却
```

Frontendでは画像の選択、プレビュー、ユーザー操作などを担当し、最終的な画像処理はBackendで実行する。

---

# 3. 使用ライブラリ

MVPでは以下を基本とする。

| ライブラリ | 用途                       |
| ---------- | -------------------------- |
| Pillow     | 画像の読み込み・変換・保存 |
| NumPy      | ピクセルデータの数値処理   |
| FastAPI    | API                        |
| Pydantic   | 入力値検証                 |

必要に応じて、色空間変換などのために追加ライブラリを導入する。

ただし、追加ライブラリは必要性を確認したうえで採用する。

---

# 4. 対応画像形式

MVPでは以下の画像形式を入力として対応する。

```text
JPEG
PNG
WebP
```

拡張子だけではなく、ファイルの実体を検証する。

---

# 5. 出力画像形式

MVPでは以下の形式を出力対象とする。

```text
WebP
JPEG
PNG
```

Web用途を主な目的とするため、デフォルトの出力形式はWebPとする。

---

# 6. 画像処理全体フロー

```text
                    ┌───────────────┐
                    │  Image File   │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ File Validate │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Image Decode  │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Image Metadata│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Image Analyze │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │Color Matching │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Image Transform│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Image Encode  │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │    Storage    │
                    └───────────────┘
```

---

# 7. ファイルアップロード

画像ファイルはBackendへMultipart形式で送信する。

基本的なリクエスト：

```text
multipart/form-data
```

画像以外のパラメータについては、API設計で定義する。

---

# 8. ファイルサイズ制限

Backendではアップロード可能なファイルサイズを制限する。

目的：

- メモリ使用量の制御
- DoS対策
- 画像処理時間の制御
- Storage容量の制御

具体的な最大ファイルサイズは、実際のBackend環境のリソースを確認したうえで決定する。

MVPでは、FrontendとBackendの両方で同じ制限値を使用する。

ただし、最終的な制限はBackend側を基準とする。

---

# 9. 画像解像度制限

ファイルサイズだけではなく、画像の解像度も検証する。

例えば、

```text
10000 × 10000
```

のような非常に大きな画像は、ファイルサイズが小さくても画像展開時に大量のメモリを消費する可能性がある。

そのため、

```text
ファイルサイズ
+
画像幅
+
画像高さ
+
総ピクセル数
```

を考慮する。

MVP の既定値は次のとおり。Render 無料枠（512MB）での Color Matching メモリ使用量に合わせる。

```text
MAX_IMAGE_WIDTH=512
MAX_IMAGE_HEIGHT=512
MAX_PIXEL_COUNT=262144
```

値は Environment Variable で変更できる。

---

# 10. Decompression Bomb対策

圧縮された画像を展開した結果、非常に巨大な画像になるケースを考慮する。

画像をデコードする前後で、画像サイズやピクセル数を確認する。

想定外に巨大な画像については処理を中止する。

---

# 11. ファイル形式検証

入力ファイルについて以下を確認する。

```text
拡張子
↓
MIME Type
↓
画像データ
↓
実際の画像形式
```

拡張子だけで画像形式を判定しない。

例えば、

```text
malicious.exe
```

を

```text
image.jpg
```

へ変更しただけのファイルを受け付けないようにする。

---

# 12. MIME Type検証

Frontendから送信されたMIME Typeは参考情報として扱う。

最終的な判定はBackend側で行う。

例：

```text
image/jpeg
image/png
image/webp
```

---

# 13. 画像デコード

Pillowを使用して画像を読み込む。

基本的な処理：

```python
from PIL import Image

image = Image.open(file)
```

ただし、実際の実装ではファイル検証、例外処理、サイズ検証などを行ったうえで画像を読み込む。

---

# 14. 画像の検証

画像を読み込んだ後、以下を確認する。

- 画像として正常に読み込める
- 幅が0ではない
- 高さが0ではない
- 最大解像度を超えていない
- 対応するColor Modeである
- 不正な画像データではない

検証に失敗した場合は処理を中止する。

---

# 15. Color Mode

入力画像のColor Modeは統一して処理する。

基本的には、

```text
RGB
RGBA
```

を扱う。

グレースケールなどの画像は、必要に応じてRGBへ変換する。

---

# 16. RGBへの正規化

画像処理の内部表現としてRGBを基本とする。

例：

```text
JPEG
 ↓
RGB

PNG
 ↓
RGB / RGBA

WebP
 ↓
RGB / RGBA
```

ただしAlpha Channelが存在する画像については、必要に応じてRGBAとして保持する。

---

# 17. Alpha Channel

PNGやWebPなど、Alpha Channelを持つ画像については透明情報を可能な限り維持する。

基本方針：

```text
RGBA入力
 ↓
RGBAとして処理
 ↓
RGBA出力
```

ただし、処理内容によってAlpha Channelを変更する必要がある場合は、RGB部分とAlpha部分を分離して扱う。

---

# 18. Alpha Channelとカラー処理

カラー調整は原則としてRGB部分に対して行う。

概念：

```text
RGBA
 ├── RGB
 │    ↓
 │  Color Processing
 │
 └── Alpha
      ↓
    Preserve
```

Alpha Channelを不用意にカラー処理へ含めない。

---

# 19. EXIF情報

JPEGなどに含まれるEXIF情報については、取り扱いを明確にする。

特に以下を考慮する。

- Orientation
- 撮影日時
- GPS
- カメラ情報

プライバシー保護の観点から、出力画像へ不要なEXIF情報を引き継がないことを基本方針とする。

特にGPSなどの位置情報は出力画像に残さない。

---

# 20. EXIF Orientation

入力画像にEXIF Orientationが存在する場合、画像処理前に正しい向きへ補正する。

概念：

```text
Input Image
    ↓
Read EXIF Orientation
    ↓
Rotate / Flip
    ↓
Normalized Image
    ↓
Image Processing
```

これにより、画像解析と出力画像の向きを一致させる。

---

# 21. 画像Metadata

画像処理開始時に以下の情報を取得する。

```text
width
height
format
mode
file size
```

必要に応じて、

```text
aspect ratio
color mode
has alpha
```

なども取得する。

---

# 22. 画像サイズ

画像の幅と高さを取得する。

```python
width, height = image.size
```

画像サイズは以下の用途に使用する。

- 入力検証
- メモリ使用量推定
- 画像解析
- 出力画像検証
- Metadata

---

# 23. アスペクト比

画像のアスペクト比を取得する。

```text
aspect ratio = width / height
```

基本的には、ColorFitによるカラー調整では画像のアスペクト比を変更しない。

---

# 24. リサイズ

ColorFitの基本的なカラー調整では、画像の解像度を変更しない。

ただし、以下の場合は内部処理用の縮小画像を作成できる。

- 色分布解析
- 主要カラー抽出
- プレビュー解析
- 大きな画像の負荷軽減

重要なのは、

```text
解析用画像
```

と

```text
最終出力画像
```

を区別することである。

---

# 25. 解析用画像

非常に大きな画像の場合、色解析には縮小画像を使用できる。

```text
Original Image
      │
      ├───────────────→ Final Processing
      │
      ↓
Resize
      ↓
Analysis Image
      ↓
Color Analysis
```

これにより、解析処理の負荷を抑える。

---

# 26. 最終出力画像

最終出力画像については、原則として元画像の解像度を維持する。

```text
Input
1920 × 1080

↓

Output
1920 × 1080
```

ただし、ユーザーが将来的に出力サイズを指定できる機能を追加する場合は別途設計する。

---

# 27. 画像解析

ColorFitでは画像解析をカラー処理の前段階として実行する。

基本的な解析項目：

- RGB値
- 色分布
- 明度
- 彩度
- 主要カラー
- 画像全体の平均色

必要に応じて追加の特徴量を使用する。

---

# 28. RGB解析

RGB画像はNumPy Arrayへ変換して処理できる。

概念：

```text
Pillow Image
      ↓
NumPy Array
      ↓
Pixel Data
```

例えばRGB画像は概念的に、

```text
height × width × 3
```

の配列として扱う。

---

# 29. ピクセル値

RGBの各チャンネルは基本的に、

```text
0 ～ 255
```

の範囲で扱う。

```text
R: 0～255
G: 0～255
B: 0～255
```

内部計算で正規化が必要な場合は、

```text
0.0 ～ 1.0
```

へ変換して扱うこともできる。

---

# 30. 平均色

画像全体の平均色を取得する。

概念：

```text
Image
 ↓
All Pixels
 ↓
Average R
Average G
Average B
 ↓
Average Color
```

平均色は画像全体の大まかな色味を把握するために使用する。

ただし、平均色だけで画像全体の色を判断しない。

---

# 31. 色分布

ColorFitでは画像の色分布を考慮する。

単純な平均色だけでは、

```text
白背景
+
青い人物
+
黒い文字
```

のような画像の構造を正確に表現できないためである。

そのため、必要に応じて主要カラーや色の分布を取得する。

---

# 32. 主要カラー

画像から主要なカラーを抽出する。

概念：

```text
Image
 ↓
Color Sampling
 ↓
Color Clustering / Quantization
 ↓
Dominant Colors
```

主要カラーの抽出方法については、実装時に性能と精度を比較して決定する。

---

# 33. 色空間

ColorFitでは、用途に応じて複数の色空間を利用する。

基本：

```text
RGB
```

RGBは画像データの基本的な表現として使用する。

一方、人間の知覚に近い色比較が必要な場合は、別の色空間への変換を検討する。

候補：

```text
HSV
HSL
Lab
LCh
```

最終的なColor Matchingで使用する色空間は、

```text
03_detail-design/04_color-matching.md
```

で決定する。

---

# 34. HSV / HSL

HSVやHSLは、色相・彩度・明度など、人間が理解しやすい形で色を扱う場合に利用できる。

特に以下の処理で利用を検討する。

- 色相変更
- 彩度調整
- 明度調整

ただし、最終的な色距離計算に適しているとは限らないため、用途を分けて使用する。

---

# 35. Lab / LCh

人間の色知覚に近い色比較が必要な場合、LabやLChの利用を検討する。

特に、

```text
Color Matching
Color Distance
```

などで利用する可能性がある。

具体的な採用方式はColor Matching詳細設計で決定する。

---

# 36. カラーマッチングとの境界

画像処理とColor Matchingの責務を分離する。

```text
Image Processing
├── Decode
├── Validate
├── Analyze
├── Transform
└── Encode

Color Matching
├── Palette Analysis
├── Color Distance
├── Target Calculation
└── Adjustment Calculation
```

Image Processingは「画像を扱う仕組み」を担当する。

Color Matchingは「どのように色を合わせるか」を担当する。

---

# 37. Color Matchingへの入力

Color Matchingへ渡す基本データ：

```text
Input Image Analysis
+
Palette
+
Palette Ratio
+
Adjustment Strength
```

概念：

```text
Image Analysis
       +
Design Palette
       +
Palette Ratio
       +
Strength
       ↓
Color Matching
       ↓
Target Adjustment
```

---

# 38. Adjustment

Color Matchingから得られた調整値をImage Transformerへ渡す。

基本的な調整項目：

```text
temperature
saturation
brightness
contrast
hue
```

---

# 39. 色温度

色温度調整では、画像全体の暖色・寒色方向を調整する。

概念：

```text
Warm
←───────┼───────→
        Neutral
                  Cool
```

具体的な計算方法はColor Matching / Image Transformation設計で決定する。

---

# 40. 色相

Hue Adjustmentでは、画像の色相を変更する。

ただし、画像全体へ単純なHue Shiftを適用すると、肌色などの重要な色まで大きく変化する可能性がある。

そのため、将来的には領域や色相範囲を考慮した調整を検討する。

MVPでは実装可能性と品質を考慮して方式を決定する。

---

# 41. 彩度

彩度調整では画像全体の色の鮮やかさを変更する。

基本的な操作：

```text
Saturation
     ↑
     │
     ●
     │
     ↓
```

過度な彩度調整による色飽和を防止する。

---

# 42. 明るさ

Brightness調整では画像の明度を変更する。

黒潰れや白飛びが過度に発生しないようにする。

---

# 43. コントラスト

Contrast調整では画像の明暗差を変更する。

過度なコントラスト調整によって、

- シャドウの黒潰れ
- ハイライトの白飛び

が発生しないようにする。

---

# 44. 色調整の適用順序

複数の画像調整を適用する場合、処理順序によって結果が変化する。

基本的な処理パイプラインは以下を候補とする。

```text
Input
 ↓
Normalize
 ↓
Color Temperature
 ↓
Hue
 ↓
Saturation
 ↓
Brightness
 ↓
Contrast
 ↓
Output
```

ただし、最終的な処理順序はテスト結果をもとに決定する。

---

# 45. 色値のClamping

画像変換後のRGB値が範囲外にならないようにする。

```text
RGB < 0
↓
0

RGB > 255
↓
255
```

正規化値を使用する場合：

```text
value < 0.0
↓
0.0

value > 1.0
↓
1.0
```

---

# 46. 色飽和防止

変換後に極端な色にならないようにする。

例えば、

```text
R = 255
G = 0
B = 255
```

のような極端な色が大量に発生する場合は、調整強度を制限する。

---

# 47. 自動調整の強度

ユーザーが設定した調整強度を考慮する。

概念：

```text
Target Adjustment
        ↓
Adjustment Strength
        ↓
Final Adjustment
```

例えば、

```text
Strength = 0%
```

の場合は、元画像を維持する。

```text
Strength = 100%
```

の場合は、算出された調整を最大限適用する。

具体的な計算方法はColor Matching詳細設計で定義する。

---

# 48. 自動調整と手動調整

自動調整と手動調整は別の処理として扱う。

```text
Original
   ↓
Auto Adjustment
   ↓
Auto Result
   ↓
Manual Adjustment
   ↓
Final Result
```

手動調整は自動調整後の結果に対して適用する。

---

# 49. プリセット

プリセットはAdjustment値の集合として扱う。

例：

```text
Natural
├── temperature
├── saturation
├── brightness
├── contrast
└── hue
```

プリセットは画像処理ロジックそのものではなく、調整値を定義するデータとして扱う。

---

# 50. プリセット適用

```text
Preset
 ↓
Adjustment Values
 ↓
Image Transformer
 ↓
Processed Image
```

プリセット適用後はユーザーが手動で値を変更できる。

---

# 51. 出力画像生成

画像処理完了後、Pillowを使用して出力画像を生成する。

基本フロー：

```text
Processed Pixel Data
        ↓
NumPy Array
        ↓
Pillow Image
        ↓
Encode
        ↓
Output File
```

---

# 52. WebP出力

WebPをColorFitのデフォルト出力形式とする。

理由：

- Web用途に適している
- JPEGより効率的な圧縮を期待できる
- PNGのような可逆圧縮にも対応可能

具体的な品質設定はExport設計で決定する。

---

# 53. JPEG出力

JPEG出力ではAlpha Channelを保持できない。

RGBA画像をJPEGへ変換する場合は、背景色などを考慮してRGBへ変換する。

透明部分を勝手に黒色などへ変換することによって、ユーザーの意図しない結果にならないよう注意する。

必要な仕様はExport詳細設計で決定する。

---

# 54. PNG出力

PNGではAlpha Channelを可能な限り維持する。

カラー処理後も透明情報が保持されるようにする。

---

# 55. 画像品質

出力品質はユーザー設定として扱う。

基本的に、

```text
Low
Medium
High
```

などのプリセット方式を検討する。

具体的な品質値は、形式ごとの特性を考慮して決定する。

---

# 56. Metadataの扱い

出力画像では不要なMetadataを削除する。

特に、

```text
GPS
Camera Information
Private Metadata
```

などの個人情報につながる可能性がある情報は保持しないことを基本とする。

---

# 57. 出力画像の検証

出力後に以下を確認する。

- ファイルが生成されている
- 正しい画像形式である
- 画像を再度読み込める
- 幅・高さが期待値である
- Alpha Channelが必要に応じて保持されている
- ファイルサイズが異常ではない

---

# 58. 入出力画像サイズの整合性

カラー調整のみを行った場合、基本的には入力と出力の画像サイズを一致させる。

```text
Input
1920 × 1080

↓

Output
1920 × 1080
```

Resize処理を行う場合は、別機能として明確に扱う。

---

# 59. 画像品質の検証

画像処理によって、

- 色が極端に変化する
- ノイズが増える
- バンディングが発生する
- 明暗が破綻する

などの問題が発生しないよう、代表的な画像を使用して検証する。

テスト画像には、

```text
人物
風景
商品
イラスト
夜景
明るい画像
暗い画像
高彩度画像
低彩度画像
```

などを含める。

---

# 60. カラー処理の品質評価

ColorFitでは、単純に数値上の色差だけでなく、Webデザインとして自然に見えるかを評価する。

評価観点：

- 元画像の雰囲気を維持している
- デザインカラーとの統一感がある
- 人物の肌色が不自然にならない
- 白色が不自然に着色されない
- 黒色が不自然に着色されない
- 高彩度部分が破綻しない
- 画像全体のコントラストが維持される

---

# 61. 重要色の保護

画像内には、ColorFitによって大きく変更したくない色が存在する。

例：

- 肌色
- 白
- 黒
- ブランドロゴ
- 商品固有色

そのため、将来的に重要色を保護する機能を検討する。

MVPでは、Color Matchingアルゴリズムの品質を確認したうえで必要性を判断する。

---

# 62. 人物画像への配慮

人物画像では、色調整によって肌色が不自然になる可能性がある。

そのため、人物画像を処理する場合は、

```text
Global Color Adjustment
```

だけに依存しない方式を将来的に検討する。

MVPではまず自然な全体調整を実現し、品質検証を行う。

---

# 63. 解析と最終処理の分離

ColorFitでは解析用処理と最終画像処理を分離する。

```text
                    Original
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
       Analysis Image       Full Resolution
             ↓                   ↓
       Color Analysis       Final Processing
             │                   │
             └─────────┬─────────┘
                       ↓
                  Output Image
```

解析処理のためだけに元画像を低解像度へ変換しない。

---

# 64. メモリ使用量

画像処理では、Pillow ImageとNumPy Arrayを同時に保持するとメモリ使用量が増加する。

そのため、

- 不要なコピーを作らない
- 大きな配列を長時間保持しない
- 解析終了後に不要なデータを解放する
- 同時処理数を制限する

などを考慮する。

---

# 65. NumPy利用方針

ピクセル単位の処理では、可能な限りPythonのforループを大量に使用せず、NumPyによるベクトル化処理を利用する。

悪い例：

```text
for y:
    for x:
        pixelを処理
```

可能な場合は、

```text
NumPy Array
↓
Vectorized Operation
↓
処理結果
```

を使用する。

これにより大量のピクセルを効率的に処理する。

---

# 66. PillowとNumPyの役割分担

基本的な役割：

```text
Pillow
├── Load
├── Save
├── Resize
├── Format Conversion
└── Metadata

NumPy
├── Pixel Array
├── Numerical Calculation
├── Color Transformation
└── Vectorized Processing
```

両者を用途に応じて使い分ける。

---

# 67. 処理の冪等性

同じ入力画像、同じPalette、同じAdjustmentを使用した場合、可能な限り同じ結果になるようにする。

```text
Input A
+
Palette A
+
Adjustment A

↓

Result A
```

再実行しても結果が予測可能であることを基本とする。

---

# 68. 一時データ

画像処理中に生成した一時データは、処理完了後に不要であれば削除する。

```text
Upload
 ↓
Temporary Data
 ↓
Process
 ↓
Output
 ↓
Cleanup
```

エラー時にも可能な限りCleanupを行う。

---

# 69. Storageへの保存

処理結果をStorageへ保存する場合、以下のような情報を管理する。

```text
imageId
originalImage
processedImage
format
width
height
createdAt
```

MVPでは永続的な画像履歴管理を目的としない。

---

# 70. ファイル名

ユーザーがアップロードした元ファイル名をそのままStorageのキーとして使用しない。

Storageでは衝突を避けるため、一意なIDを生成する。

概念：

```text
UUID
+
extension
```

などを使用する。

---

# 71. Storage Key

概念的な構造：

```text
images/
  {image-id}/
    original
    processed
```

実際のStorage Keyについては、

```text
03_detail-design/05_storage.md
```

で定義する。

---

# 72. エラー処理

画像処理では以下のエラーを想定する。

```text
INVALID_FILE
UNSUPPORTED_FORMAT
FILE_TOO_LARGE
IMAGE_TOO_LARGE
INVALID_IMAGE
IMAGE_DECODE_FAILED
IMAGE_PROCESSING_FAILED
OUTPUT_GENERATION_FAILED
STORAGE_FAILED
```

ユーザー向けメッセージと内部ログを分離する。

---

# 73. 画像処理エラー

画像処理中に予期しないエラーが発生した場合、

```text
500 Internal Server Error
```

など適切なHTTP Statusへ変換する。

内部のExceptionやStack TraceをFrontendへ返さない。

---

# 74. タイムアウト

画像処理が一定時間を超えた場合はTimeoutを考慮する。

特に、

- 巨大画像
- 複雑な解析
- 大量の同時リクエスト

を考慮する。

長時間処理が必要になった場合はJob Queue方式を検討する。

---

# 75. 処理時間計測

画像処理では処理時間を計測する。

基本：

```text
Start
 ↓
Decode Time
 ↓
Analysis Time
 ↓
Matching Time
 ↓
Transform Time
 ↓
Encode Time
 ↓
Storage Time
 ↓
Total Time
```

これにより性能ボトルネックを特定できるようにする。

---

# 76. ログ

ログには以下を記録できる。

```text
requestId
imageId
operation
inputWidth
inputHeight
inputFormat
processingTime
result
errorCode
```

画像そのものや機密情報はログへ保存しない。

---

# 77. セキュリティ

画像処理では、アップロードファイルを信頼しない。

基本的な対策：

- ファイルサイズ制限
- 解像度制限
- MIME Type検証
- 実体検証
- 画像デコード時のエラー処理
- 一時ファイル管理
- Storageアクセス制御
- 不要なMetadata削除

---

# 78. 外部URLからの画像取得

MVPでは、ユーザーが指定した外部URLから画像を取得する機能は実装しない。

理由：

```text
URL
 ↓
Backend
 ↓
外部アクセス
```

を許可すると、SSRFなどのセキュリティリスクが発生するためである。

画像入力は基本的にユーザーがアップロードしたファイルを対象とする。

---

# 79. 画像の保存期間

MVPでは画像を恒久的に保存しない。

基本方針：

```text
Upload
 ↓
Processing
 ↓
Result
 ↓
Download
 ↓
不要になったデータを削除
```

具体的な保存期間・自動削除方式については、

```text
03_detail-design/05_storage.md
```

で定義する。

---

# 80. 画像処理の基本APIフロー

基本的な画像処理フロー：

```text
POST /api/v1/images
        ↓
Image Upload
        ↓
Image ID
        ↓
POST /api/v1/images/analyze
        ↓
Analysis Result
        ↓
POST /api/v1/images/transform
        ↓
Processed Image
        ↓
POST /api/v1/exports
        ↓
Exported Image
```

実際のAPI構成は `06_api.md` で確定する。

---

# 81. 自動調整処理

自動調整では以下を入力とする。

```text
Original Image
Palette
Palette Ratio
Adjustment Strength
```

処理：

```text
Input
 ↓
Image Analysis
 ↓
Palette Analysis
 ↓
Color Matching
 ↓
Adjustment Calculation
 ↓
Image Transformation
 ↓
Output
```

Color Matchingの具体的な処理は、

```text
03_detail-design/04_color-matching.md
```

に委譲する。

---

# 82. 手動調整処理

手動調整ではFrontendからAdjustment値を受け取る。

```text
temperature
saturation
brightness
contrast
hue
```

処理：

```text
Original / Auto Result
        ↓
Adjustment
        ↓
Image Transformer
        ↓
Output
```

---

# 83. 自動調整と手動調整の組み合わせ

基本的な処理：

```text
Original
   ↓
Auto Adjustment
   ↓
Auto Result
   ↓
Manual Adjustment
   ↓
Final Result
```

手動調整値を元画像へ直接適用するのではなく、自動調整後の状態を基準とする。

---

# 84. プレビューと最終画像

FrontendのプレビューとBackendの最終処理は役割を分ける。

```text
Frontend
↓
高速Preview
↓
ユーザー確認

Backend
↓
Final Processing
↓
高品質Output
```

FrontendプレビューはUXを優先し、Backendは最終品質を優先する。

---

# 85. PreviewとFinalの差異

PreviewとFinalで可能な限り同じ調整ロジックを使用する。

ただし、

- Previewは低解像度
- Finalは元解像度
- Previewは高速処理
- Finalは高品質処理

という違いを許容する。

---

# 86. 品質検証

画像処理品質は、代表的なテスト画像を用いて確認する。

最低限、以下を用意する。

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

これらを基準画像として使用する。

---

# 87. 回帰テスト

画像処理アルゴリズムを変更した場合、既存のテスト画像を使用して回帰テストを行う。

確認項目：

- 処理が成功する
- 出力画像が生成される
- 画像サイズが維持される
- Alpha Channelが維持される
- 極端な色変化が発生しない
- 処理時間が大幅に悪化していない

---

# 88. Color Matchingとの責務分離

本書で定義する範囲：

```text
画像を扱う
画像を読み込む
画像を検証する
画像を解析する
画像を変換する
画像を保存する
```

`04_color-matching.md`で定義する範囲：

```text
どの色へ合わせるか
どの色を重要視するか
配色比率をどう利用するか
色距離をどう計算するか
調整量をどう算出するか
```

この境界を維持する。

---

# 89. 将来の拡張

将来的に以下の機能を追加できる構造を意識する。

- 高度な色域処理
- カラープロファイル対応
- HDR画像対応
- RAW画像対応
- 複数画像処理
- バッチ処理
- GPU処理
- 非同期Job Queue
- 高度な人物領域保護
- オブジェクト単位のカラー調整

ただし、MVPでは実装しない。

---

# 90. 実装原則

画像処理実装では以下を原則とする。

1. Pillowを画像I/Oの基本ライブラリとして使用する。
2. NumPyを数値計算・ピクセル処理に使用する。
3. 画像入力を必ず検証する。
4. Frontendの検証結果を信用しない。
5. ファイルサイズを制限する。
6. 画像解像度を制限する。
7. EXIF Orientationを考慮する。
8. 不要なMetadataを出力へ残さない。
9. Alpha Channelを可能な限り維持する。
10. 入力画像の解像度をカラー調整だけで変更しない。
11. 解析用画像と最終出力画像を分離する。
12. 不要なNumPy Arrayのコピーを作らない。
13. 可能な限りNumPyによるベクトル化処理を使用する。
14. RGB値の範囲外をClampingする。
15. 画像処理ロジックをAPI Routerへ直接記述しない。
16. Color Matchingロジックと画像処理基盤を分離する。
17. 代表的な画像による品質テストを行う。
18. アルゴリズム変更時には回帰テストを行う。
19. 処理時間を計測できるようにする。
20. 画像データを不要にログへ出力しない。

---

# 91. 完了条件

画像処理詳細設計は以下を満たすことを完了条件とする。

- [ ] 対応画像形式が定義されている
- [ ] 出力形式が定義されている
- [ ] ファイルサイズ制限方針が定義されている
- [ ] 画像解像度制限方針が定義されている
- [ ] ファイル検証方式が定義されている
- [ ] MIME Type検証が定義されている
- [ ] RGB / RGBAの扱いが定義されている
- [ ] Alpha Channelの扱いが定義されている
- [ ] EXIFの扱いが定義されている
- [ ] 画像解析の基本方針が定義されている
- [ ] RGB / HSV / Lab / LChの役割が整理されている
- [ ] PillowとNumPyの役割分担が定義されている
- [ ] 画像変換の基本方針が定義されている
- [ ] 出力画像の検証方法が定義されている
- [ ] 画像品質の評価方法が定義されている
- [ ] エラー処理方針が定義されている
- [ ] セキュリティ方針が定義されている
- [ ] メモリ使用量への対策が定義されている
- [ ] 処理時間の計測方針が定義されている
- [ ] 回帰テスト方針が定義されている
- [ ] Color Matchingとの責務境界が明確になっている
