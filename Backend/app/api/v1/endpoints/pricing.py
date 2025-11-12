from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import Dict
from decimal import Decimal
from app.database import get_db
from app.schemas.pricing import PricingDetail
from app.crud import pricing as crud_pricing
from app.crud import staffing as crud_staffing
from app.crud import activity as crud_activity
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/pricingDetails", response_model=PricingDetail)
async def get_pricing_details(
    staffing_id: str = Query(..., description="Staffing ID"),
    country: str = Query(..., description="Country"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get pricing details based on staffing ID and country
    """
    # First get the staffing detail to get role and band
    from app.models.staffing import StaffingDetail
    staffing = db.query(StaffingDetail).filter(
        StaffingDetail.staffing_id == staffing_id
    ).first()
    
    if not staffing:
        raise HTTPException(status_code=404, detail="Staffing detail not found")
    
    # Get pricing details
    pricing = crud_pricing.get_pricing_details(
        db=db,
        country=country,
        role=staffing.role,
        band=staffing.band
    )
    
    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing details not found")
    
    return pricing


@router.get("/totalHoursAndPrices/{offering_id}")
async def get_total_hours_and_prices(
    offering_id: str = Path(..., description="Offering ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Calculate total hours and prices for an offering
    """
    from app.models.staffing import StaffingDetail
    from app.models.pricing import PricingDetail
    
    # Get all staffing details for the offering
    staffing_details = crud_staffing.get_staffing_by_offering(db, offering_id)
    
    if not staffing_details:
        return {
            "offering_id": offering_id,
            "total_hours": 0,
            "total_cost": 0,
            "total_sale_price": 0,
            "breakdown": []
        }
    
    total_hours = 0
    total_cost = Decimal(0)
    total_sale_price = Decimal(0)
    breakdown = []
    
    for staffing in staffing_details:
        # Get pricing for this staffing
        pricing = crud_pricing.get_pricing_details(
            db=db,
            country=staffing.country,
            role=staffing.role,
            band=staffing.band
        )
        
        hours = staffing.hours or 0
        total_hours += hours
        
        if pricing:
            cost = (pricing.cost or Decimal(0)) * Decimal(hours)
            sale_price = (pricing.sale_price or Decimal(0)) * Decimal(hours)
            total_cost += cost
            total_sale_price += sale_price
            
            breakdown.append({
                "staffing_id": staffing.staffing_id,
                "country": staffing.country,
                "role": staffing.role,
                "band": staffing.band,
                "hours": hours,
                "cost_per_hour": float(pricing.cost) if pricing.cost else 0,
                "sale_price_per_hour": float(pricing.sale_price) if pricing.sale_price else 0,
                "total_cost": float(cost),
                "total_sale_price": float(sale_price)
            })
    
    return {
        "offering_id": offering_id,
        "total_hours": total_hours,
        "total_cost": float(total_cost),
        "total_sale_price": float(total_sale_price),
        "breakdown": breakdown
    }