from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from typing import Optional

from app.models.database import get_db
from app.models.models import HomepageSection
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/homepage", tags=["Homepage"])

# Schemas
class HomepageSectionBase(BaseModel):
    section_id: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    content: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    is_visible: Optional[bool] = True
    display_order: Optional[int] = 0

class HomepageSectionCreate(HomepageSectionBase):
    pass

class HomepageSectionResponse(HomepageSectionBase):
    id: int
    class Config:
        orm_mode = True

# Endpoints
@router.get("/", response_model=List[HomepageSectionResponse])
def get_homepage_sections(db: Session = Depends(get_db)):
    """Get all visible homepage sections sorted by display order"""
    sections = db.query(HomepageSection).order_by(HomepageSection.display_order.asc()).all()
    return sections

@router.post("/", response_model=HomepageSectionResponse)
def create_section(
    section: HomepageSectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if section_id exists
    existing = db.query(HomepageSection).filter(HomepageSection.section_id == section.section_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Section ID already exists")

    db_section = HomepageSection(**section.dict())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

@router.put("/{section_id}", response_model=HomepageSectionResponse)
def update_section(
    section_id: str,
    section_update: HomepageSectionBase,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_section = db.query(HomepageSection).filter(HomepageSection.section_id == section_id).first()
    if not db_section:
        # If it doesn't exist, create it (Upsert)
        db_section = HomepageSection(section_id=section_id)
        db.add(db_section)
    
    update_data = section_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_section, key, value)
        
    db.commit()
    db.refresh(db_section)
    return db_section

@router.delete("/{section_id}")
def delete_section(
    section_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_section = db.query(HomepageSection).filter(HomepageSection.section_id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
        
    db.delete(db_section)
    db.commit()
    return {"message": "Section deleted successfully"}
