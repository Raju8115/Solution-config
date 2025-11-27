from fastapi import APIRouter, Depends, Path, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.staffing import Staffing, StaffingCreate, StaffingUpdate
from app.crud import staffing as crud_staffing
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import require_admin

router = APIRouter()

@router.get("/staffing/all", response_model=List[Staffing])
async def get_all_staffing(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all staffing master records - Available to all authenticated users"""
    staffing_list = crud_staffing.get_all_staffing(db)
    return staffing_list

@router.get("/staffing/{staffing_id}", response_model=Staffing)
async def get_staffing_by_id(
    staffing_id: str = Path(..., description="Staffing ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific staffing record by ID - Available to all authenticated users"""
    staffing = crud_staffing.get_staffing_by_id(db, staffing_id)
    if not staffing:
        raise HTTPException(status_code=404, detail="Staffing record not found")
    return staffing

@router.get("/staffing/search", response_model=Staffing)
async def get_staffing_by_criteria(
    country: str = Query(..., description="Country"),
    role: str = Query(..., description="Role"),
    band: int = Query(..., description="Band"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get staffing by country, role, and band - Available to all authenticated users"""
    staffing = crud_staffing.get_staffing_by_criteria(db, country, role, band)
    if not staffing:
        raise HTTPException(status_code=404, detail="Staffing record not found")
    return staffing

from typing import List, Dict, Any

@router.get("/staffing/offering/{offering_id}", response_model=List[Dict[str, Any]])
async def get_staffing_by_offering(
    offering_id: str = Path(..., description="Offering ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get all staffing details for an offering (linked through activities and WBS).
    Returns staffing with activity_id associations for frontend filtering.
    Available to all authenticated users.
    """
    staffing_details = crud_staffing.get_staffing_by_offering(db, offering_id)
    return staffing_details



# WRITE - Administrator only
@router.post("/staffing", response_model=Staffing, status_code=status.HTTP_201_CREATED)
async def create_staffing(
    staffing: StaffingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create a new staffing record - **Requires Administrator access**"""
    return crud_staffing.create_staffing(db, staffing)

@router.put("/staffing/{staffing_id}", response_model=Staffing)
async def update_staffing(
    staffing_id: str,
    staffing_update: StaffingUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update a staffing record - **Requires Administrator access**"""
    updated_staffing = crud_staffing.update_staffing(db, staffing_id, staffing_update)
    if not updated_staffing:
        raise HTTPException(status_code=404, detail="Staffing record not found")
    return updated_staffing

@router.delete("/staffing/{staffing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staffing(
    staffing_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete a staffing record - **Requires Administrator access**"""
    success = crud_staffing.delete_staffing(db, staffing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Staffing record not found")
    return None