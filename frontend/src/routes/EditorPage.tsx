import { ImagePreview } from '../features/editor/ImagePreview'
import { ImageUploader } from '../features/editor/ImageUploader'
import { PaletteEditor } from '../features/editor/PaletteEditor'
import { StrengthSlider } from '../features/editor/StrengthSlider'
import { useImageUpload } from '../hooks/useImageUpload'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePalette } from '../hooks/usePalette'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'
import { formatFileSize, formatImageType } from '../lib/format/fileSize'

export function EditorPage() {
  usePageTitle(PAGE_TITLES[ROUTES.editor])
  const { status, image, previewUrl, errorMessage, selectFile, clearImage } =
    useImageUpload()
  const palette = usePalette()
  const hasImage = Boolean(previewUrl && (image || status === 'uploading'))

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+28px)] pb-20"
    >
      <h1 className="sr-only">画像を調整</h1>
      <div className="editor-layout mx-auto w-full max-w-[1600px] px-5 md:px-7">
        <div className="editor-panel-design">
          <PaletteEditor
            colors={palette.colors}
            hexValue={palette.hexValue}
            errorMessage={
              palette.validation.ok ? null : palette.validation.message
            }
            onColorChange={palette.setColor}
            onRatioChange={palette.setRatio}
          />
        </div>

        <section className="editor-panel-canvas" aria-label="画像プレビュー">
          <p className="mb-4 max-w-2xl text-text-muted">
            {image
              ? 'アップロードした画像と、合わせたい配色を確認できます。'
              : 'まだ画像がアップロードされていません。'}
          </p>
          <ImageUploader
            status={status}
            errorMessage={errorMessage}
            hasImage={hasImage}
            onSelectFile={(file) => {
              void selectFile(file)
            }}
            onRemove={clearImage}
          >
            {previewUrl ? (
              <ImagePreview
                src={previewUrl}
                alt={
                  image
                    ? `${image.filename}のプレビュー`
                    : '選択した画像のプレビュー'
                }
              />
            ) : null}
          </ImageUploader>
          {image ? (
            <p className="mt-4 text-sm text-text-subtle">
              <span>
                {image.width} × {image.height} px
              </span>
              <span aria-hidden="true"> ・ </span>
              <span>{formatImageType(image.mimeType)}</span>
              <span aria-hidden="true"> ・ </span>
              <span>{formatFileSize(image.fileSize)}</span>
            </p>
          ) : null}
        </section>

        <div className="editor-panel-adjust">
          <StrengthSlider
            value={palette.strength}
            onChange={palette.setStrength}
          />
        </div>
      </div>
    </main>
  )
}
