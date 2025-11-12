from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.country import Country
from app.crud import country as crud_country
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/countries", response_model=List[Country])
async def get_countries(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get list of all countries
    """
    return crud_country.get_countries(db)