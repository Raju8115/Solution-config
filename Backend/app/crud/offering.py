from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.activity import OfferingActivity
from app.models.offering import Offering
from typing import List, Optional

def get_offerings(db: Session, product_id: Optional[str] = None) -> List[Offering]:
    query = db.query(Offering)
    if product_id:
        query = query.filter(Offering.product_id == product_id)
    return query.order_by(Offering.offering_name).all()


def get_offerings_by_product(db: Session, product_id: str) -> List[Offering]:
    return db.query(Offering).filter(Offering.product_id == product_id).all()


def get_offering_by_id(db: Session, offering_id: str, include_activities: bool = False) -> Optional[Offering]:
    query = db.query(Offering).filter(Offering.offering_id == offering_id)
    
    if include_activities:
        query = query.options(
            joinedload(Offering.activities).joinedload(OfferingActivity.activity)
        )
    
    return query.first()
 

def search_offerings(
    db: Session,
    query: Optional[str] = None,
    saas_type: Optional[str] = None,
    industry: Optional[str] = None,
    client_type: Optional[str] = None,
    framework_category: Optional[str] = None
) -> List[Offering]:
    """
    Search offerings based on multiple criteria
    """
    db_query = db.query(Offering)
    
    if query:
        search_filter = or_(
            Offering.offering_name.ilike(f"%{query}%"),
            Offering.offering_summary.ilike(f"%{query}%"),
            Offering.tag_line.ilike(f"%{query}%"),
            Offering.elevator_pitch.ilike(f"%{query}%"),
            Offering.offering_tags.ilike(f"%{query}%")
        )
        db_query = db_query.filter(search_filter)
    
    if saas_type:
        db_query = db_query.filter(Offering.saas_type == saas_type)
    
    if industry:
        db_query = db_query.filter(Offering.industry == industry)
    
    if client_type:
        db_query = db_query.filter(Offering.client_type == client_type)
    
    if framework_category:
        db_query = db_query.filter(Offering.framework_category == framework_category)
    
    return db_query.all()