from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class BrandBase(BaseModel):
    brand_name: str
    description: Optional[str] = None


class BrandCreate(BrandBase):
    pass


class Brand(BrandBase):
    brand_id: UUID

    class Config:
        from_attributes = True