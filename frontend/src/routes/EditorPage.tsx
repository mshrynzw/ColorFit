import { Container } from '../components/layout/Container'
import { ImagePreview } from '../features/editor/ImagePreview'
import { ImageUploader } from '../features/editor/ImageUploader'
import { useImageUpload } from '../hooks/useImageUpload'
import { usePageTitle } from '../hooks/usePageTitle'
import { PAGE_TITLES, ROUTES } from '../lib/constants/routes'
import { formatFileSize, formatImageType } from '../lib/format/fileSize'

export function EditorPage() {
  usePageTitle(PAGE_TITLES[ROUTES.editor])
  const { status, image, previewUrl, errorMessage, selectFile, clearImage } =
    useImageUpload()
  const hasImage = Boolean(previewUrl && (image || status === 'uploading'))

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+48px)] pb-20"
    >
      <Container>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">画像を調整</h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          {image
            ? 'アップロードした画像を確認できます。配色の設定は次のステップで行います。'
            : 'まだ画像がアップロードされていません。'}
        </p>

        <div className="mt-8">
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
                alt={image ? `${image.filename}のプレビュー` : '選択した画像のプレビュー'}
              />
            ) : null}
          </ImageUploader>
        </div>

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
      </Container>
    </main>
  )
}
