from sqlalchemy.orm import Session
from app.models.wbs_staffing import WBSStaffing
from app.schemas.wbs import WBSStaffingCreate, WBSStaffingUpdate
from typing import List, Optional


def get_wbs_staffing_by_wbs(db: Session, wbs_id: str) -> List[WBSStaffing]:
    """Get all staffing entries for a specific WBS"""
    return db.query(WBSStaffing).filter(WBSStaffing.wbs_id == wbs_id).all()


def get_wbs_staffing_by_staffing(db: Session, staffing_id: str) -> List[WBSStaffing]:
    """Get all WBS entries for a specific staffing"""
    return db.query(WBSStaffing).filter(WBSStaffing.staffing_id == staffing_id).all()


def get_wbs_staffing(db: Session, wbs_id: str, staffing_id: str) -> Optional[WBSStaffing]:
    """Get a specific WBS-Staffing relationship"""
    return db.query(WBSStaffing).filter(
        WBSStaffing.wbs_id == wbs_id,
        WBSStaffing.staffing_id == staffing_id
    ).first()


def create_wbs_staffing(db: Session, wbs_staffing: WBSStaffingCreate) -> WBSStaffing:
    """Create a new WBS-Staffing relationship"""
    db_wbs_staffing = WBSStaffing(**wbs_staffing.dict())
    db.add(db_wbs_staffing)
    db.commit()
    db.refresh(db_wbs_staffing)
    return db_wbs_staffing


def update_wbs_staffing(
    db: Session,
    wbs_id: str,
    staffing_id: str,
    wbs_staffing: WBSStaffingUpdate
) -> Optional[WBSStaffing]:
    """Update hours for a WBS-Staffing relationship"""
    db_wbs_staffing = get_wbs_staffing(db, wbs_id, staffing_id)
    
    if not db_wbs_staffing:
        return None
    
    update_data = wbs_staffing.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_wbs_staffing, field, value)
    
    db.commit()
    db.refresh(db_wbs_staffing)
    return db_wbs_staffing


def delete_wbs_staffing(db: Session, wbs_id: str, staffing_id: str) -> bool:
    """Delete a WBS-Staffing relationship"""
    db_wbs_staffing = get_wbs_staffing(db, wbs_id, staffing_id)
    
    if not db_wbs_staffing:
        return False
    
    db.delete(db_wbs_staffing)
    db.commit()
    return True

# Made with Bob
