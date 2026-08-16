from pydantic import BaseModel, Field


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str = Field(alias="requestId")

    model_config = {"populate_by_name": True}


class ErrorResponse(BaseModel):
    error: ErrorBody
