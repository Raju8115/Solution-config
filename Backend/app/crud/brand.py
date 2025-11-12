from sqlalchemy.orm import Session
from app.models.brand import Brand
from typing import List


def get_brands(db: Session) -> List[Brand]:
    return db.query(Brand).all()


def get_brand_by_id(db: Session, brand_id: str) -> Brand:
    return db.query(Brand).filter(Brand.brand_id == brand_id).first()