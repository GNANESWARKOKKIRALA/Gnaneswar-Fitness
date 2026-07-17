from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import ContactMessage
from app.schemas.schemas import ContactMessageCreate, ContactMessageResponse

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("", response_model=ContactMessageResponse)
def create_contact_message(message_in: ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = ContactMessage(
        name=message_in.name,
        email=message_in.email,
        message=message_in.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
