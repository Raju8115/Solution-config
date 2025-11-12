from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.staffing import StaffingDetail
from app.crud import staffing as crud_staffing
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/staffingDetails/{offering_id}", response_model=List[StaffingDetail])
async def get_staffing_details(
    offering_id: str = Path(..., description="Offering ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get staffing details by offering ID
    """
    staffing_details = crud_staffing.get_staffing_by_offering(db, offering_id)
    return staffing_details