from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.product import Product
from app.crud import product as crud_product
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/products", response_model=List[Product])
async def get_products(
    brand_id: str = Query(..., description="Brand ID to filter products"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get products by brand ID
    """
    products = crud_product.get_products_by_brand(db, brand_id)
    return products