from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from decimal import Decimal
from app.database import get_db
from app.schemas.pricing import PricingDetail, PricingDetailCreate, PricingDetailUpdate
from app.crud import pricing as crud_pricing
from app.crud import staffing as crud_staffing
from app.models.pricing import PricingDetail as PricingModel
from app.models.staffing import Staffing
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import require_admin


router = APIRouter()


# READ - Available to all authenticated users


@router.get("/pricing/all", response_model=List[Dict[str, Any]])
async def get_all_pricing(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get all pricing details with staffing information (role, band, country)
    Available to all authenticated users
    """
    # Join pricing with staffing to get role, band, country
    results = db.query(
        PricingModel.pricing_id,
        PricingModel.staffing_id,
        PricingModel.cost,
        PricingModel.sale_price,
        Staffing.country,
        Staffing.role,
        Staffing.band
    ).join(
        Staffing, 
        PricingModel.staffing_id == Staffing.staffing_id
    ).all()
    
    # Format the response
    pricing_list = []
    for row in results:
        pricing_list.append({
            "pricing_id": str(row.pricing_id),
            "staffing_id": str(row.staffing_id),
            "cost": float(row.cost) if row.cost else None,
            "sale_price": float(row.sale_price) if row.sale_price else None,
            "country": row.country,
            "role": row.role,
            "band": row.band
        })
    
    return pricing_list


@router.get("/pricing/{pricing_id}", response_model=Dict[str, Any])
async def get_pricing_by_id(
    pricing_id: str = Path(..., description="Pricing ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get pricing details by ID with staffing information
    Available to all authenticated users
    """
    # Join pricing with staffing to get complete information
    result = db.query(
        PricingModel.pricing_id,
        PricingModel.staffing_id,
        PricingModel.cost,
        PricingModel.sale_price,
        Staffing.country,
        Staffing.role,
        Staffing.band
    ).join(
        Staffing,
        PricingModel.staffing_id == Staffing.staffing_id
    ).filter(
        PricingModel.pricing_id == pricing_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Pricing details not found")
    
    return {
        "pricing_id": str(result.pricing_id),
        "staffing_id": str(result.staffing_id),
        "cost": float(result.cost) if result.cost else None,
        "sale_price": float(result.sale_price) if result.sale_price else None,
        "country": result.country,
        "role": result.role,
        "band": result.band
    }


@router.get("/pricing/staffing/{staffing_id}", response_model=PricingDetail)
async def get_pricing_by_staffing(
    staffing_id: str = Path(..., description="Staffing ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get pricing details by staffing ID
    Available to all authenticated users
    """
    pricing = crud_pricing.get_pricing_by_staffing_id(db, staffing_id)
    
    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing details not found for this staffing")
    
    return pricing


@router.get("/totalHoursAndPrices/{offering_id}")
async def get_total_hours_and_prices(
    offering_id: str = Path(..., description="Offering ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Calculate total hours and prices for an offering
    Available to all authenticated users
    """
    
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


# WRITE - Administrator only


@router.post("/pricing", response_model=PricingDetail, status_code=status.HTTP_201_CREATED)
async def create_pricing(
    pricing: PricingDetailCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create new pricing details - **Requires Administrator access**"""
    # Check if pricing already exists for this staffing_id
    existing = crud_pricing.get_pricing_by_staffing_id(db, str(pricing.staffing_id))
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pricing already exists for this staffing"
        )
    
    return crud_pricing.create_pricing(db, pricing)


@router.put("/pricing/{pricing_id}", response_model=PricingDetail)
async def update_pricing(
    pricing_id: str = Path(..., description="Pricing ID"),
    pricing_update: PricingDetailUpdate = ...,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update pricing details - **Requires Administrator access**"""
    updated_pricing = crud_pricing.update_pricing(db, pricing_id, pricing_update)
    if not updated_pricing:
        raise HTTPException(status_code=404, detail="Pricing details not found")
    return updated_pricing


@router.delete("/pricing/{pricing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pricing(
    pricing_id: str = Path(..., description="Pricing ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete pricing details - **Requires Administrator access**"""
    success = crud_pricing.delete_pricing(db, pricing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pricing details not found")
    return None
