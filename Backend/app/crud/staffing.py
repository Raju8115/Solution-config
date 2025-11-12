from sqlalchemy.orm import Session
from app.models.staffing import StaffingDetail
from typing import List


from sqlalchemy.orm import Session
from app.models import StaffingDetail, Activity, OfferingActivity

def get_staffing_by_offering(db: Session, offering_id: str):
    return (
        db.query(StaffingDetail)
        .join(Activity, StaffingDetail.activity_id == Activity.activity_id)
        .join(OfferingActivity, OfferingActivity.activity_id == Activity.activity_id)
        .filter(OfferingActivity.offering_id == offering_id)
        .all()
    )
