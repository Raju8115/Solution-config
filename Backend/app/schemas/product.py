from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ProductBase(BaseModel):
    product_name: str
    description: Optional[str] = None
    brand_id: UUID


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    product_id: UUID

    class Config:
        from_attributes = True