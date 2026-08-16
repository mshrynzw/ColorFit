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
