from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import Announcement, User
from app.schemas.schemas import AnnouncementCreate, AnnouncementResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Order by newest announcements
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

@router.post("", response_model=AnnouncementResponse, status_code=201)
def create_announcement(
    ann_in: AnnouncementCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_ann = Announcement(
        title=ann_in.title,
        content=ann_in.content
    )
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann
