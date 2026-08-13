from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.database import get_db
from app.models.models import WebsiteSetting, User
from app.api.deps import get_current_admin

router = APIRouter(prefix="/settings", tags=["settings"])

DEFAULT_SETTINGS = {
    "site_name": "Gnaneswar Fit",
    "site_tagline": "Elite Bodybuilding Coaching & Nutrition Blueprints",
    "coach_name": "Gnaneswar Kokkirala",
    "coach_title": "Certified Strength & Conditioning Specialist",
    "coach_bio": "Dedicated bodybuilding coach specializing in scientific progressive overload, macronutrient modeling, and physique transformation.",
    "contact_email": "gapbodybuilder@gmail.com",
    "contact_phone": "+91 6309764875",
    "instagram_url": "https://instagram.com/gnaneswar_bb",
    "youtube_url": "https://youtube.com",
    "logo_url": "/logo.png"
}

@router.get("")
def get_website_settings(db: Session = Depends(get_db)):
    settings_rows = db.query(WebsiteSetting).all()
    res = dict(DEFAULT_SETTINGS)
    for row in settings_rows:
        res[row.key] = row.value
    return res

@router.post("")
def update_website_settings(
    settings_dict: Dict[str, Any] = Body(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    for key, value in settings_dict.items():
        val_str = str(value) if value is not None else ""
        row = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
        if row:
            row.value = val_str
        else:
            row = WebsiteSetting(key=key, value=val_str)
            db.add(row)
            
    db.commit()
    return get_website_settings(db)
