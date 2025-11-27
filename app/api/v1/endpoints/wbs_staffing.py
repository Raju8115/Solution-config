from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID
from app.database import get_db
from app.models.wbs import WBS
from app.models.wbs_staffing import WBSStaffing
from app.models.staffing import Staffing
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import require_admin

router = APIRouter(prefix="/wbs-staffing", tags=["WBS-Staffing"])

@router.get("/{wbs_id}", response_model=List[Dict[str, Any]])
def get_staffing_for_wbs(
    wbs_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all staffing assigned to a WBS with hours"""
    results = db.query(
        WBSStaffing.wbs_id,
        WBSStaffing.staffing_id,
        WBSStaffing.hours,
        Staffing.country,
        Staffing.role,
        Staffing.band
    ).join(
        Staffing, WBSStaffing.staffing_id == Staffing.staffing_id
    ).filter(
        WBSStaffing.wbs_id == wbs_id
    ).all()
    
    staffing_list = []
    for row in results:
        staffing_list.append({
            "wbs_id": str(row.wbs_id),
            "staffing_id": str(row.staffing_id),
            "hours": row.hours,
            "country": row.country,
            "role": row.role,
            "band": row.band
        })
    
    return staffing_list

@router.post("/")
def add_staffing_to_wbs(
    wbs_id: UUID,
    staffing_id: UUID,
    hours: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Assign staffing to WBS with hours - **Requires Administrator access**"""
    
    # Check if WBS exists
    wbs = db.query(WBS).filter(WBS.wbs_id == wbs_id).first()
    if not wbs:
        raise HTTPException(status_code=404, detail="WBS not found")
    
    # Check if Staffing exists
    staffing = db.query(Staffing).filter(Staffing.staffing_id == staffing_id).first()
    if not staffing:
        raise HTTPException(status_code=404, detail="Staffing not found")
    
    # Check if assignment already exists
    existing = db.query(WBSStaffing).filter(
        WBSStaffing.wbs_id == wbs_id,
        WBSStaffing.staffing_id == staffing_id
    ).first()
    
    if existing:
        # Update hours
        existing.hours = hours
    else:
        # Create new assignment
        wbs_staffing = WBSStaffing(
            wbs_id=wbs_id,
            staffing_id=staffing_id,
            hours=hours
        )
        db.add(wbs_staffing)
    
    db.commit()
    return {"message": "Staffing assigned to WBS successfully"}

@router.put("/{wbs_id}/{staffing_id}")
def update_wbs_staffing_hours(
    wbs_id: UUID,
    staffing_id: UUID,
    hours: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update hours for WBS-Staffing assignment - **Requires Administrator access**"""
    
    wbs_staffing = db.query(WBSStaffing).filter(
        WBSStaffing.wbs_id == wbs_id,
        WBSStaffing.staffing_id == staffing_id
    ).first()
    
    if not wbs_staffing:
        raise HTTPException(status_code=404, detail="WBS-Staffing assignment not found")
    
    wbs_staffing.hours = hours
    db.commit()
    
    return {"message": "Hours updated successfully"}

@router.delete("/{wbs_id}/{staffing_id}")
def remove_staffing_from_wbs(
    wbs_id: UUID,
    staffing_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Remove staffing from WBS - **Requires Administrator access**"""
    
    wbs_staffing = db.query(WBSStaffing).filter(
        WBSStaffing.wbs_id == wbs_id,
        WBSStaffing.staffing_id == staffing_id
    ).first()
    
    if not wbs_staffing:
        raise HTTPException(status_code=404, detail="WBS-Staffing assignment not found")
    
    db.delete(wbs_staffing)
    db.commit()
    
    return {"message": "Staffing removed from WBS successfully"}
