from app.core.exceptions import AppError, ErrorCode


class R2Storage:
    def __init__(
        self,
        endpoint: str,
        access_key_id: str,
        secret_access_key: str,
        bucket_name: str,
    ) -> None:
        if not all([endpoint, access_key_id, secret_access_key, bucket_name]):
            raise AppError(
                ErrorCode.STORAGE_CONNECTION_FAILED,
                "画像を保存できませんでした。",
                503,
            )
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError as exc:
            raise AppError(
                ErrorCode.STORAGE_CONNECTION_FAILED,
                "画像を保存できませんでした。",
                503,
            ) from exc

        self.bucket_name = bucket_name
        self._client_error = ClientError
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
        )

    def put(self, key: str, data: bytes, content_type: str) -> None:
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_UPLOAD_FAILED,
                "画像を保存できませんでした。",
                503,
            ) from exc

    def get(self, key: str) -> bytes:
        try:
            response = self.client.get_object(Bucket=self.bucket_name, Key=key)
            return response["Body"].read()
        except self._client_error as exc:
            if _is_not_found(exc):
                raise AppError(
                    ErrorCode.IMAGE_NOT_FOUND,
                    "画像が見つかりません。",
                    404,
                ) from exc
            raise AppError(
                ErrorCode.STORAGE_DOWNLOAD_FAILED,
                "画像を取得できませんでした。",
                503,
            ) from exc
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_DOWNLOAD_FAILED,
                "画像を取得できませんでした。",
                503,
            ) from exc

    def delete(self, key: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_DELETE_FAILED,
                "画像を削除できませんでした。",
                503,
            ) from exc

    def exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            return False


def _is_not_found(exc: Exception) -> bool:
    response = getattr(exc, "response", {}) or {}
    code = str(response.get("Error", {}).get("Code", ""))
    return code in {"NoSuchKey", "404", "NotFound", "NoSuchBucket"}
