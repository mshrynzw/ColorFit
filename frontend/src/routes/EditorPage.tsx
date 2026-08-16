import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getResult } from '../api/images'
import { ImagePreview } from '../features/editor/ImagePreview'
import { ImageUploader } from '../features/editor/ImageUploader'
import { PaletteEditor } from '../features/editor/PaletteEditor'
import { PaletteFlow } from '../features/editor/PaletteFlow'
import { ProcessingButton } from '../features/editor/ProcessingButton'
import { StrengthSlider } from '../features/editor/StrengthSlider'
import { useCyclingMessage } from '../hooks/useCyclingMessage'
import { useEditorEntrance } from '../hooks/useEditorEntrance'
import { useImageProcessing } from '../hooks/useImageProcessing'
import { useImageUpload } from '../hooks/useImageUpload'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePalette } from '../hooks/usePalette'
import { useSettings } from '../hooks/useSettings'
import { PROCESSING_STATUS_MESSAGES } from '../lib/constants/processing'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'
import { formatFileSize, formatImageType } from '../lib/format/fileSize'

export function EditorPage() {
  usePageTitle(PAGE_TITLES[ROUTES.editor])
  const layoutRef = useRef<HTMLDivElement>(null)
  useEditorEntrance(layoutRef)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restoreId = searchParams.get('imageId')
  const { status, image, previewUrl, errorMessage, selectFile, clearImage, restoreFromId } =
    useImageUpload()
  const { settings } = useSettings()
  const palette = usePalette(settings.adjustmentStrength / 100)
  const {
    status: processingStatus,
    processedUrl,
    errorMessage: processingError,
    process,
    reset: resetProcessing,
  } = useImageProcessing()
  const restoring = Boolean(restoreId) && !image && status === 'uploading'
  const hasImage = Boolean(previewUrl && (image || status === 'uploading'))
  const displayUrl = processedUrl ?? previewUrl
  const isProcessing = processingStatus === 'processing'
  const processingMessage = useCyclingMessage(
    PROCESSING_STATUS_MESSAGES,
    isProcessing,
  )
  const canProcess =
    Boolean(image) &&
    status === 'success' &&
    palette.validation.ok &&
    !isProcessing

  const hydratePalette = palette.hydrate

  useEffect(() => {
    resetProcessing()
  }, [image?.id, resetProcessing])

  useEffect(() => {
    if (!restoreId || image?.id) {
      return
    }
    void restoreFromId(restoreId)
    void getResult(restoreId)
      .then((result) => {
        if (result.palette && result.strength != null) {
          hydratePalette({
            palette: result.palette,
            strength: result.strength,
          })
        }
      })
      .catch(() => {
        // Image restore is enough to continue editing.
      })
  }, [hydratePalette, image?.id, restoreFromId, restoreId])

  useEffect(() => {
    if (processingStatus === 'success' && image) {
      void navigate(`${ROUTES.result}?imageId=${image.id}`)
    }
  }, [image, navigate, processingStatus])

  let processHint =
    '設定した配色とデザインの配色に基づいて、画像の色味を自動調整します。'
  if (!image) {
    processHint = '画像をアップロードすると、配色に合わせて調整できます。'
  } else if (!palette.validation.ok) {
    processHint = palette.validation.message
  } else if (isProcessing) {
    processHint = 'ColorFitが画像を解析・調整しています。'
  } else if (processingStatus === 'error' && processingError) {
    processHint = `${processingError} 配色を確認して、もう一度お試しください。`
  } else if (processingStatus === 'success') {
    processHint = '調整が完了しました。プレビューに反映しています。'
  }

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+28px)] pb-20"
    >
      <h1 className="sr-only">画像を調整</h1>
      <div
        ref={layoutRef}
        className="editor-layout mx-auto w-full max-w-[1600px] px-5 md:px-7"
      >
        <div className="editor-panel-design" data-anim="panel-left">
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

        <section
          className="editor-panel-canvas"
          data-anim="panel-canvas"
          aria-label="画像プレビュー"
        >
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
            overlayMessage={processingMessage}
            busyMessage={
              restoring ? '画像を読み込んでいます…' : 'アップロードしています…'
            }
            onSelectFile={(file) => {
              void selectFile(file)
            }}
            onRemove={clearImage}
          >
            {displayUrl ? (
              <>
                <PaletteFlow colors={palette.colors} />
                <ImagePreview
                  src={displayUrl}
                  alt={
                    image
                      ? processedUrl
                        ? `${image.filename}の調整後プレビュー`
                        : `${image.filename}のプレビュー`
                      : '選択した画像のプレビュー'
                  }
                  badge={processedUrl ? '調整後' : undefined}
                />
              </>
            ) : null}
          </ImageUploader>
          {image ? (
            <p className="editor-image-meta mt-4 text-text-subtle">
              <span>
                {image.width} × {image.height} px
              </span>
              <span aria-hidden="true">・</span>
              <span>{formatImageType(image.mimeType)}</span>
              <span aria-hidden="true">・</span>
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

        <div className="editor-panel-adjust" data-anim="panel-right">
          <StrengthSlider
            value={palette.strength}
            onChange={palette.setStrength}
          />
        </div>
      </div>
    </main>
  )
}
