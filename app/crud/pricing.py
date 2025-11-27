from sqlalchemy.orm import Session
from app.models.pricing import PricingDetail
from app.schemas.pricing import PricingDetailCreate, PricingDetailUpdate
from typing import Optional, List
import uuid


def get_pricing_by_id(db: Session, pricing_id: str) -> Optional[PricingDetail]:
    """Get pricing detail by ID"""
    return db.query(PricingDetail).filter(PricingDetail.pricing_id == pricing_id).first()


def get_pricing_by_staffing_id(db: Session, staffing_id: str) -> Optional[PricingDetail]:
    """Get pricing details for a specific staffing_id"""
    return db.query(PricingDetail).filter(PricingDetail.staffing_id == staffing_id).first()


def get_all_pricing(db: Session) -> List[PricingDetail]:
    """Get all pricing details"""
    return db.query(PricingDetail).all()


def create_pricing(db: Session, pricing: PricingDetailCreate) -> PricingDetail:
    """Create a new pricing detail"""
    db_pricing = PricingDetail(
        pricing_id=uuid.uuid4(),
        staffing_id=pricing.staffing_id,
        cost=pricing.cost,
        sale_price=pricing.sale_price
    )
    db.add(db_pricing)
    db.commit()
    db.refresh(db_pricing)
    return db_pricing


def update_pricing(
    db: Session,
    pricing_id: str,
    pricing: PricingDetailUpdate
) -> Optional[PricingDetail]:
    """Update an existing pricing detail"""
    db_pricing = db.query(PricingDetail).filter(
        PricingDetail.pricing_id == pricing_id
    ).first()
    
    if not db_pricing:
        return None
    
    update_data = pricing.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pricing, field, value)
    
    db.commit()
    db.refresh(db_pricing)
    return db_pricing


def delete_pricing(db: Session, pricing_id: str) -> bool:
    """Delete a pricing detail"""
    db_pricing = db.query(PricingDetail).filter(
        PricingDetail.pricing_id == pricing_id
    ).first()
    
    if not db_pricing:
        return False
    
    db.delete(db_pricing)
    db.commit()
    return True