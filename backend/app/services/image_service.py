import json
import logging
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.config import Settings
from app.core.exceptions import AppError, ErrorCode
from app.processing.export import encode_for_download, normalize_export_options
from app.processing.transformer import transform_image
from app.schemas.image import ImageDetail, ImageInfo, ProcessResult
from app.schemas.palette import AdjustmentInput
from app.services.storage_service import StorageService
from app.storage.keys import (
    meta_key,
    original_key,
    parse_image_id,
    processed_key,
)
from app.utils.filenames import processed_download_name, sanitize_filename
from app.utils.image_validation import ValidatedImage, validate_image

logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self, storage: StorageService, settings: Settings) -> None:
        self.storage = storage
        self.settings = settings

    def upload(
        self,
        filename: str | None,
        content_type: str | None,
        data: bytes,
    ) -> ImageInfo:
        validated = validate_image(
            data,
            content_type,
            self.settings.max_image_width,
            self.settings.max_image_height,
            self.settings.max_pixel_count,
        )
        image_id = str(uuid4())
        safe_filename = sanitize_filename(filename)
        created_at = datetime.now(timezone.utc)
        try:
            self.storage.put(
                original_key(image_id),
                validated.data,
                validated.mime_type,
            )
            self.storage.put(
                meta_key(image_id),
                _meta_bytes(
                    image_id,
                    safe_filename,
                    validated,
                    created_at,
                ),
                "application/json",
            )
        except AppError:
            self.storage.delete_image(image_id)
            raise

        logger.info("image uploaded id=%s size=%s", image_id, validated.file_size)
        return ImageInfo(
            id=image_id,
            filename=safe_filename,
            mime_type=validated.mime_type,
            file_size=validated.file_size,
            width=validated.width,
            height=validated.height,
        )

    def get_info(self, raw_image_id: str) -> ImageDetail:
        return self._load_detail(raw_image_id)

    def download(
        self,
        raw_image_id: str,
        source: str | None = None,
        export_format: str | None = None,
        quality: str | None = None,
    ) -> tuple[bytes, str, str]:
        detail = self._load_detail(raw_image_id)
        image_id = detail.id
        if source not in {None, "", "auto", "original", "processed"}:
            raise AppError(
                ErrorCode.INVALID_REQUEST,
                "ダウンロード対象が正しくありません。",
                400,
            )
        fmt, level = normalize_export_options(export_format, quality)
        has_processed = self.storage.exists(processed_key(image_id))
        if source == "processed" and not has_processed:
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "処理結果が見つかりません。",
                404,
            )
        if source != "original" and has_processed:
            data = self.storage.get(processed_key(image_id))
            if fmt is None or level is None:
                return (
                    data,
                    "image/webp",
                    processed_download_name(detail.filename),
                )
            converted, mime_type, extension = encode_for_download(data, fmt, level)
            return (
                converted,
                mime_type,
                processed_download_name(detail.filename, extension),
            )
        return (
            self.storage.get(original_key(image_id)),
            detail.mime_type,
            detail.filename,
        )

    def process(self, raw_image_id: str, adjustment: AdjustmentInput) -> ProcessResult:
        detail = self._load_detail(raw_image_id)
        original = self.storage.get(original_key(detail.id))
        processed = transform_image(original, adjustment)
        self.storage.put(processed_key(detail.id), processed, "image/webp")
        meta = self._load_meta(detail.id)
        meta["status"] = "completed"
        meta["processedMimeType"] = "image/webp"
        meta["adjustment"] = {
            "palette": [item.model_dump() for item in adjustment.palette],
            "strength": adjustment.strength,
        }
        self.storage.put(
            meta_key(detail.id),
            json.dumps(meta, ensure_ascii=True).encode("utf-8"),
            "application/json",
        )
        logger.info("image processed id=%s", detail.id)
        return self._process_result(
            detail.id,
            meta,
            result_url=f"/api/images/{detail.id}/result",
        )

    def get_result(self, raw_image_id: str) -> ProcessResult:
        detail = self._load_detail(raw_image_id)
        if not self.storage.exists(processed_key(detail.id)):
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "処理結果が見つかりません。",
                404,
            )
        meta = self._load_meta(detail.id)
        return self._process_result(
            detail.id,
            meta,
            result_url=f"/api/images/{detail.id}/download",
        )

    def _process_result(
        self,
        image_id: str,
        meta: dict,
        result_url: str,
    ) -> ProcessResult:
        adjustment = meta.get("adjustment")
        palette = None
        strength = None
        if isinstance(adjustment, dict):
            raw_palette = adjustment.get("palette")
            raw_strength = adjustment.get("strength")
            if isinstance(raw_palette, list):
                palette = raw_palette
            if isinstance(raw_strength, (int, float)):
                strength = float(raw_strength)
        return ProcessResult(
            image_id=image_id,
            status="completed",
            result_url=result_url,
            original_url=f"/api/images/{image_id}",
            palette=palette,
            strength=strength,
        )

    def delete(self, raw_image_id: str) -> None:
        image_id = parse_image_id(raw_image_id)
        self.storage.delete_image(image_id)

    def _load_meta(self, image_id: str) -> dict:
        raw_meta = self.storage.get(meta_key(image_id))
        return json.loads(raw_meta.decode("utf-8"))

    def _load_detail(self, raw_image_id: str) -> ImageDetail:
        image_id = parse_image_id(raw_image_id)
        try:
            raw_meta = self.storage.get(meta_key(image_id))
            meta = json.loads(raw_meta.decode("utf-8"))
        except (AppError, UnicodeDecodeError, json.JSONDecodeError, TypeError) as exc:
            if isinstance(exc, AppError) and exc.code != ErrorCode.IMAGE_NOT_FOUND:
                raise
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "画像が見つかりません。",
                404,
            ) from exc

        if self._is_expired(meta.get("createdAt")):
            self.storage.delete_image(image_id)
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "画像が見つかりません。",
                404,
            )

        if not self.storage.exists(original_key(image_id)):
            self.storage.delete_image(image_id)
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "画像が見つかりません。",
                404,
            )

        try:
            return ImageDetail(
                id=str(meta["id"]),
                filename=str(meta["filename"]),
                mime_type=str(meta["mimeType"]),
                file_size=int(meta["fileSize"]),
                width=int(meta["width"]),
                height=int(meta["height"]),
                status=str(meta.get("status", "uploaded")),
            )
        except (KeyError, TypeError, ValueError) as exc:
            logger.warning("invalid image metadata id=%s", image_id)
            self.storage.delete_image(image_id)
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "画像が見つかりません。",
                404,
            ) from exc

    def _is_expired(self, created_at_raw: object) -> bool:
        if self.settings.image_ttl_hours <= 0:
            return False
        if not isinstance(created_at_raw, str):
            return True
        try:
            created_at = datetime.fromisoformat(created_at_raw)
        except ValueError:
            return True
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - created_at.astimezone(timezone.utc)
        return age >= timedelta(hours=self.settings.image_ttl_hours)


def _meta_bytes(
    image_id: str,
    filename: str,
    validated: ValidatedImage,
    created_at: datetime,
) -> bytes:
    payload = {
        "id": image_id,
        "filename": filename,
        "mimeType": validated.mime_type,
        "fileSize": validated.file_size,
        "width": validated.width,
        "height": validated.height,
        "status": "uploaded",
        "createdAt": created_at.isoformat(),
    }
    return json.dumps(payload, ensure_ascii=True).encode("utf-8")
