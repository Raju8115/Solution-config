from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.wbs import WBSCreate, WBSUpdate, WBSResponse, ActivityWBSCreate
from app.crud import wbs as crud_wbs

router = APIRouter(prefix="/wbs", tags=["WBS"])


@router.post("/", response_model=WBSResponse)
def create_wbs(wbs: WBSCreate, db: Session = Depends(get_db)):
    return crud_wbs.create_wbs(db, wbs)


@router.get("/", response_model=List[WBSResponse])
def get_all_wbs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_wbs.get_all_wbs(db, skip, limit)


@router.get("/{wbs_id}", response_model=WBSResponse)
def get_wbs(wbs_id: UUID, db: Session = Depends(get_db)):
    db_wbs = crud_wbs.get_wbs(db, wbs_id)
    if not db_wbs:
        raise HTTPException(status_code=404, detail="WBS not found")
    return db_wbs


@router.put("/{wbs_id}", response_model=WBSResponse)
def update_wbs(wbs_id: UUID, wbs: WBSUpdate, db: Session = Depends(get_db)):
    db_wbs = crud_wbs.update_wbs(db, wbs_id, wbs)
    if not db_wbs:
        raise HTTPException(status_code=404, detail="WBS not found")
    return db_wbs


@router.delete("/{wbs_id}")
def delete_wbs(wbs_id: UUID, db: Session = Depends(get_db)):
    if not crud_wbs.delete_wbs(db, wbs_id):
        raise HTTPException(status_code=404, detail="WBS not found")
    return {"message": "WBS deleted successfully"}


@router.post("/activity/{activity_id}/wbs/{wbs_id}")
def add_wbs_to_activity(activity_id: UUID, wbs_id: UUID, db: Session = Depends(get_db)):
    try:
        crud_wbs.add_wbs_to_activity(db, activity_id, wbs_id)
        return {"message": "WBS added to activity successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/activity/{activity_id}/wbs/{wbs_id}")
def remove_wbs_from_activity(activity_id: UUID, wbs_id: UUID, db: Session = Depends(get_db)):
    if not crud_wbs.remove_wbs_from_activity(db, activity_id, wbs_id):
        raise HTTPException(status_code=404, detail="Association not found")
    return {"message": "WBS removed from activity successfully"}


@router.get("/activity/{activity_id}/wbs", response_model=List[WBSResponse])
def get_wbs_for_activity(activity_id: UUID, db: Session = Depends(get_db)):
    return crud_wbs.get_wbs_for_activity(db, activity_id)