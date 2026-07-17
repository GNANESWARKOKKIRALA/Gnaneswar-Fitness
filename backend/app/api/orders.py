import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import Order, Program, User
from app.schemas.schemas import OrderResponse
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="", tags=["orders"])

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    plan_id: int = Form(...),
    amount: float = Form(...),
    screenshot: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify program exists
    program = db.query(Program).filter(Program.id == plan_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Validate image file extension
    file_ext = os.path.splitext(screenshot.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG or PNG screenshots are allowed"
        )

    # Make upload folder if not exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save the screenshot file
    filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    try:
        async with aiofiles.open(filepath, "wb") as buffer:
            while content := await screenshot.read(1024 * 1024):  # read in 1MB chunks
                await buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save screenshot: {str(e)}"
        )

    # Create order database record with state 'pending'
    db_order = Order(
        user_id=current_user.id,
        plan_id=plan_id,
        amount=amount,
        screenshot_url=f"/uploads/{filename}",
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/me", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(Order.user_id == current_user.id).all()

@router.get("/plans/me", response_model=List[OrderResponse])
def get_my_unlocked_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Unlocked plans are those orders that are 'approved'
    return db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == "approved"
    ).all()
