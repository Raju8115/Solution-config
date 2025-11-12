from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.brand import Brand
from app.crud import brand as crud_brand
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/brands", response_model=List[Brand])
async def get_brands(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get list of all brands
    """
    return crud_brand.get_brands(db)