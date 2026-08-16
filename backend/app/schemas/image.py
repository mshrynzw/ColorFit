from pydantic import BaseModel, ConfigDict, Field


class ImageInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    filename: str
    mime_type: str = Field(alias="mimeType")
    file_size: int = Field(alias="fileSize")
    width: int
    height: int


class ImageUploadResponse(BaseModel):
    image: ImageInfo


class ImageDetail(ImageInfo):
    status: str


class ImageDetailResponse(BaseModel):
    image: ImageDetail


class ProcessResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    image_id: str = Field(alias="imageId")
    status: str
    result_url: str = Field(alias="resultUrl")
    original_url: str | None = Field(default=None, alias="originalUrl")


class ProcessResponse(BaseModel):
    result: ProcessResult
