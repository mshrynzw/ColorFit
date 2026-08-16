from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"
    max_upload_size: int = 10 * 1024 * 1024
    max_image_width: int = 8192
    max_image_height: int = 8192
    max_pixel_count: int = 20_000_000
    image_ttl_hours: int = 24
    storage_backend: str = "local"
    storage_local_path: str = "./data/storage"
    r2_endpoint: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = ""
    r2_public_base_url: str = ""
    rate_limit_window_seconds: int = 60
    rate_limit_upload: int = 30
    rate_limit_process: int = 20
    rate_limit_download: int = 60

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip() and origin.strip() != "*"
        ]

    def validate_for_app(self) -> None:
        if self.is_development:
            return
        if not self.cors_origin_list:
            raise RuntimeError(
                "CORS_ORIGINS must be set to the Frontend origin in production."
            )
        if self.storage_backend.strip().lower() == "r2" and not all(
            [
                self.r2_endpoint,
                self.r2_access_key_id,
                self.r2_secret_access_key,
                self.r2_bucket_name,
            ]
        ):
            raise RuntimeError(
                "R2 configuration is required when STORAGE_BACKEND=r2."
            )

    def rate_limit_for(self, bucket: str) -> tuple[int, int]:
        limits = {
            "upload": self.rate_limit_upload,
            "process": self.rate_limit_process,
            "download": self.rate_limit_download,
        }
        return limits.get(bucket, 0), self.rate_limit_window_seconds


@lru_cache
def get_settings() -> Settings:
    return Settings()
