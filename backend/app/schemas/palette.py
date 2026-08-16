from pydantic import BaseModel


class PaletteColor(BaseModel):
    name: str
    color: str
    ratio: float


class AdjustmentInput(BaseModel):
    palette: list[PaletteColor]
    strength: float
