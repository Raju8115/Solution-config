from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class PricingDetailBase(BaseModel):
    country: str
    role: str
    band: int
    cost: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None


class PricingDetailCreate(PricingDetailBase):
    pass


class PricingDetail(PricingDetailBase):

    class Config:
        from_attributes = True