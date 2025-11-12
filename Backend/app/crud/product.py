from sqlalchemy.orm import Session
from app.models.product import Product
from typing import List, Optional


def get_products_by_brand(db: Session, brand_id: str) -> List[Product]:
    return db.query(Product).filter(Product.brand_id == brand_id).all()


def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
    return db.query(Product).filter(Product.product_id == product_id).first()