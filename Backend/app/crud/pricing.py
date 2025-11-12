from sqlalchemy.orm import Session
from app.models.pricing import PricingDetail
from typing import Optional


def get_pricing_details(
    db: Session,
    country: str,
    role: str,
    band: int
) -> Optional[PricingDetail]:
    return db.query(PricingDetail).filter(
        PricingDetail.country == country,
        PricingDetail.role == role,
        PricingDetail.band == band
    ).first()