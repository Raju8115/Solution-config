from sqlalchemy.orm import Session
from app.models.activity import Activity
from app.models.staffing import Staffing
from app.schemas.staffing import StaffingCreate, StaffingUpdate
from typing import List, Optional
import uuid
from app.models.activity import OfferingActivity
from app.models.activity_wbs import ActivityWBS
from app.models.wbs_staffing import WBSStaffing
from app.models.wbs import WBS


def get_all_staffing(db: Session) -> List[Staffing]:
    """Get all staffing master records"""
    return db.query(Staffing).all()


def get_staffing_by_id(db: Session, staffing_id: str) -> Optional[Staffing]:
    """Get a single staffing record by ID"""
    return db.query(Staffing).filter(Staffing.staffing_id == staffing_id).first()


def get_staffing_by_criteria(
    db: Session,
    country: str,
    role: str,
    band: int
) -> Optional[Staffing]:
    """Get staffing by country, role, and band"""
    return db.query(Staffing).filter(
        Staffing.country == country,
        Staffing.role == role,
        Staffing.band == band
    ).first()



def get_staffing_by_offering(db: Session, offering_id: str):
    """
    Get staffing details for an offering with activity associations.
    Returns staffing records with activity_id for frontend filtering.
    
    Relationship chain:
    Offering -> OfferingActivity -> Activity -> ActivityWBS -> WBS -> WBSStaffing -> Staffing
    """
    
    # Query with proper joins through the relationship chain
    results = db.query(
        Staffing.staffing_id,
        Staffing.country,
        Staffing.role,
        Staffing.band,
        WBSStaffing.hours,
        Activity.activity_id
    ).select_from(OfferingActivity).join(
        Activity, OfferingActivity.activity_id == Activity.activity_id
    ).join(
        ActivityWBS, Activity.activity_id == ActivityWBS.activity_id
    ).join(
        WBS, ActivityWBS.wbs_id == WBS.wbs_id
    ).join(
        WBSStaffing, WBS.wbs_id == WBSStaffing.wbs_id
    ).join(
        Staffing, WBSStaffing.staffing_id == Staffing.staffing_id
    ).filter(
        OfferingActivity.offering_id == offering_id
    ).all()
    
    # Format for frontend consumption
    staffing_list = []
    for row in results:
        staffing_list.append({
            "staffing_id": str(row.staffing_id),
            "activity_id": str(row.activity_id),  # Critical: activity_id for filtering
            "country": row.country,
            "role": row.role,
            "band": row.band,
            "hours": row.hours or 0
        })
    
    return staffing_list



def create_staffing(db: Session, staffing: StaffingCreate) -> Staffing:
    """Create a new staffing record"""
    # Check if combination already exists
    existing = get_staffing_by_criteria(db, staffing.country, staffing.role, staffing.band)
    if existing:
        return existing
    
    db_staffing = Staffing(
        staffing_id=uuid.uuid4(),
        country=staffing.country,
        role=staffing.role,
        band=staffing.band
    )
    db.add(db_staffing)
    db.commit()
    db.refresh(db_staffing)
    return db_staffing


def update_staffing(
    db: Session,
    staffing_id: str,
    staffing: StaffingUpdate
) -> Optional[Staffing]:
    """Update an existing staffing record"""
    db_staffing = db.query(Staffing).filter(
        Staffing.staffing_id == staffing_id
    ).first()
    
    if not db_staffing:
        return None
    
    update_data = staffing.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_staffing, field, value)
    
    db.commit()
    db.refresh(db_staffing)
    return db_staffing


def delete_staffing(db: Session, staffing_id: str) -> bool:
    """Delete a staffing record"""
    db_staffing = db.query(Staffing).filter(
        Staffing.staffing_id == staffing_id
    ).first()
    
    if not db_staffing:
        return False
    
    db.delete(db_staffing)
    db.commit()
    return True