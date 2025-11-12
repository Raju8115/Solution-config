from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.offering import Offering
from app.crud import offering as crud_offering
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/offerings", response_model=List[Offering])
async def get_offerings(
    product_id: str = Query(..., description="Product ID to filter offerings"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get offerings by product ID
    """
    offerings = crud_offering.get_offerings_by_product(db, product_id)
    return offerings


@router.get("/offerings/{offering_id}", response_model=Offering)
async def get_offering_by_id(
    offering_id: str = Path(..., description="Offering ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get offering by offering ID
    """
    offering = crud_offering.get_offering_by_id(db, offering_id)
    if not offering:
        raise HTTPException(status_code=404, detail="Offering not found")
    return offering


@router.get("/offerings/search/", response_model=List[Offering])
async def search_offerings(
    query: Optional[str] = Query(None, description="Search query"),
    saas_type: Optional[str] = Query(None, description="Filter by SaaS type"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    client_type: Optional[str] = Query(None, description="Filter by client type"),
    framework_category: Optional[str] = Query(None, description="Filter by framework category"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Search offerings with multiple filters
    """
    offerings = crud_offering.search_offerings(
        db=db,
        query=query,
        saas_type=saas_type,
        industry=industry,
        client_type=client_type,
        framework_category=framework_category
    )
    return offerings