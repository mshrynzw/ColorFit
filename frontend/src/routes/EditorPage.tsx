import { useEffect } from 'react'

import { ImagePreview } from '../features/editor/ImagePreview'
import { ImageUploader } from '../features/editor/ImageUploader'
import { PaletteEditor } from '../features/editor/PaletteEditor'
import { ProcessingButton } from '../features/editor/ProcessingButton'
import { StrengthSlider } from '../features/editor/StrengthSlider'
import { useImageProcessing } from '../hooks/useImageProcessing'
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
  const {
    status: processingStatus,
    processedUrl,
    errorMessage: processingError,
    process,
    reset: resetProcessing,
  } = useImageProcessing()
  const hasImage = Boolean(previewUrl && (image || status === 'uploading'))
  const displayUrl = processedUrl ?? previewUrl
  const isProcessing = processingStatus === 'processing'
  const canProcess =
    Boolean(image) &&
    status === 'success' &&
    palette.validation.ok &&
    !isProcessing

  useEffect(() => {
    resetProcessing()
  }, [image?.id, resetProcessing])

  let processHint =
    '設定した配色とデザインの配色に基づいて、画像の色味を自動調整します。'
  if (!image) {
    processHint = '画像をアップロードすると、配色に合わせて調整できます。'
  } else if (!palette.validation.ok) {
    processHint = palette.validation.message
  } else if (isProcessing) {
    processHint = 'ColorFitが画像を解析・調整しています。'
  } else if (processingStatus === 'error' && processingError) {
    processHint = processingError
  } else if (processingStatus === 'success') {
    processHint = '調整が完了しました。プレビューに反映しています。'
  }

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
              ? processingStatus === 'success'
                ? '設定した配色に合わせて画像を調整しました。'
                : 'アップロードした画像と、合わせたい配色を確認できます。'
              : 'まだ画像がアップロードされていません。'}
          </p>
          <ImageUploader
            status={status}
            errorMessage={errorMessage}
            hasImage={hasImage}
            overlayMessage={isProcessing ? '配色を解析しています…' : null}
            onSelectFile={(file) => {
              void selectFile(file)
            }}
            onRemove={clearImage}
          >
            {displayUrl ? (
              <ImagePreview
                src={displayUrl}
                alt={
                  image
                    ? processedUrl
                      ? `${image.filename}の調整後プレビュー`
                      : `${image.filename}のプレビュー`
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
          <ProcessingButton
            disabled={!canProcess}
            loading={isProcessing}
            hint={processHint}
            hintIsError={processingStatus === 'error'}
            onProcess={() => {
              if (!image || !palette.validation.ok) {
                return
              }
              void process(image.id, palette.payload)
            }}
          />
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
