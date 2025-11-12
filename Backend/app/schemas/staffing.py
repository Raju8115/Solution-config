from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class StaffingDetailBase(BaseModel):
    staffing_id: UUID
    activity_id:UUID
    country: Optional[str] = None
    role: Optional[str] = None
    band: Optional[int] = None
    hours: Optional[int] = None


class StaffingDetailCreate(StaffingDetailBase):
    pass


class StaffingDetail(StaffingDetailBase):
    staffing_id: UUID

    class Config:
        from_attributes = True