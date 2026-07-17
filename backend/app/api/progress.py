from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import ProgressEntry, User
from app.schemas.schemas import ProgressEntryResponse, ProgressEntryCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("", response_model=List[ProgressEntryResponse])
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ProgressEntry).filter(
        ProgressEntry.user_id == current_user.id
    ).order_by(ProgressEntry.date.desc()).all()

@router.post("", response_model=ProgressEntryResponse)
def create_progress_entry(
    entry_in: ProgressEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_entry = ProgressEntry(
        user_id=current_user.id,
        date=entry_in.date,
        weight=entry_in.weight,
        measurements=entry_in.measurements,
        photo_url=entry_in.photo_url
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
