from pydantic import BaseModel


class PolygonCreate(BaseModel):
    name: str
    geometry: dict
