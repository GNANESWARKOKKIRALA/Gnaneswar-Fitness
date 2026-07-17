from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import os
import uuid
import aiofiles
from app.models.database import get_db
from app.models.models import ChatMessage, User
from app.schemas.schemas import ChatMessageResponse, UserResponse
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/coach", response_model=UserResponse)
def get_coach_details(db: Session = Depends(get_db)):
    coach = db.query(User).filter(User.role == "admin").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    return coach

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    recipient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve messages where sender=me & receiver=recipient or sender=recipient & receiver=me
    messages = db.query(ChatMessage).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == recipient_id),
            and_(ChatMessage.sender_id == recipient_id, ChatMessage.receiver_id == current_user.id)
        )
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/send", response_model=ChatMessageResponse)
async def send_message(
    receiver_id: int = Form(...),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")
        
    file_url = None
    file_type = None
    
    if file:
        file_ext = os.path.splitext(file.filename)[1].lower()
        # Save attachment
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        
        try:
            async with aiofiles.open(filepath, "wb") as buffer:
                while chunk := await file.read(1024 * 1024):
                    await buffer.write(chunk)
            file_url = f"/uploads/{filename}"
            
            # Determine file type
            if file_ext in [".png", ".jpg", ".jpeg", ".gif"]:
                file_type = "image"
            elif file_ext == ".pdf":
                file_type = "pdf"
            elif file_ext in [".mp3", ".wav", ".m4a", ".ogg"]:
                file_type = "voice"
            else:
                file_type = "document"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    db_msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content,
        file_url=file_url,
        file_type=file_type,
        is_read=False
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.post("/read")
def mark_messages_as_read(
    sender_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mark messages sent by recipient to current_user as read
    db.query(ChatMessage).filter(
        ChatMessage.sender_id == sender_id,
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).update({ChatMessage.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "Messages marked as read"}
