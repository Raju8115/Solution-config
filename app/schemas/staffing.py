from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class StaffingBase(BaseModel):
    country: str
    role: str
    band: int


class StaffingCreate(StaffingBase):
    pass


class StaffingUpdate(BaseModel):
    """All fields optional for partial updates"""
    country: Optional[str] = None
    role: Optional[str] = None
    band: Optional[int] = None


class Staffing(StaffingBase):
    staffing_id: UUID

    class Config:
        from_attributes = True