from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import Response

from app.core.config import Settings, get_settings
from app.core.exceptions import AppError, ErrorCode
from app.schemas.image import ImageDetailResponse, ImageUploadResponse, ProcessResponse
from app.schemas.palette import AdjustmentInput
from app.services.image_service import ImageService
from app.services.storage_service import StorageService
from app.storage.factory import get_storage_backend
from app.utils.image_validation import read_upload_limited

router = APIRouter(prefix="/api/images", tags=["images"])


def get_image_service(
    settings: Settings = Depends(get_settings),
) -> ImageService:
    return ImageService(StorageService(get_storage_backend()), settings)


@router.post("", status_code=201, response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile | None = File(default=None),
    image_service: ImageService = Depends(get_image_service),
    settings: Settings = Depends(get_settings),
) -> ImageUploadResponse:
    if file is None:
        raise AppError(
            ErrorCode.INVALID_FILE,
            "画像ファイルを指定してください。",
            400,
        )

    data = await read_upload_limited(file, settings.max_upload_size)
    image = image_service.upload(file.filename, file.content_type, data)
    return ImageUploadResponse(image=image)


@router.get("/{image_id}", response_model=ImageDetailResponse)
def get_image(
    image_id: str,
    image_service: ImageService = Depends(get_image_service),
) -> ImageDetailResponse:
    return ImageDetailResponse(image=image_service.get_info(image_id))


@router.post("/{image_id}/process", response_model=ProcessResponse)
def process_image(
    image_id: str,
    body: AdjustmentInput,
    image_service: ImageService = Depends(get_image_service),
) -> ProcessResponse:
    return ProcessResponse(result=image_service.process(image_id, body))


@router.get("/{image_id}/result", response_model=ProcessResponse)
def get_result(
    image_id: str,
    image_service: ImageService = Depends(get_image_service),
) -> ProcessResponse:
    return ProcessResponse(result=image_service.get_result(image_id))


@router.get("/{image_id}/download")
def download_image(
    image_id: str,
    source: str | None = Query(default=None),
    image_service: ImageService = Depends(get_image_service),
) -> Response:
    data, mime_type, filename = image_service.download(image_id, source)
    safe_name = filename.replace('"', "").replace("\r", "").replace("\n", "")
    ascii_name = safe_name.encode("ascii", "ignore").decode() or "image"
    return Response(
        content=data,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{ascii_name}"',
            "Cache-Control": "private, no-store",
        },
    )


@router.delete("/{image_id}", status_code=204)
def delete_image(
    image_id: str,
    image_service: ImageService = Depends(get_image_service),
) -> Response:
    image_service.delete(image_id)
    return Response(status_code=204)
