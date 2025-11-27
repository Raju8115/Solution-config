from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from uuid import UUID


class PricingDetailBase(BaseModel):
    staffing_id: UUID
    cost: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None


class PricingDetailCreate(PricingDetailBase):
    pass


class PricingDetailUpdate(BaseModel):
    """All fields optional for partial updates"""
    staffing_id: Optional[UUID] = None
    cost: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None


class PricingDetail(PricingDetailBase):
    pricing_id: UUID

    class Config:
        from_attributes = True