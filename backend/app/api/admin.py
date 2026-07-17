from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.database import get_db
from app.models.models import Order, User, Program, Transformation
from app.schemas.schemas import OrderResponse, OrderRejectRequest, ProgramResponse, ProgramCreate, UserResponse
from app.api.deps import get_current_admin
import os
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Returns all orders (both pending, under_review, approved, and rejected)
    # Ordered by pending first, then date
    return db.query(Order).order_by(
        Order.status == 'approved', 
        Order.status == 'rejected', 
        Order.created_at.desc()
    ).all()

@router.post("/orders/{order_id}/approve", response_model=OrderResponse)
def approve_order(
    order_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "approved"
    order.reviewed_by = current_admin.id
    order.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)
    return order

@router.post("/orders/{order_id}/reject", response_model=OrderResponse)
def reject_order(
    order_id: int,
    reject_in: OrderRejectRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "rejected"
    order.reject_reason = reject_in.reason
    order.reviewed_by = current_admin.id
    order.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)
    return order

@router.put("/content/programs/{program_id}", response_model=ProgramResponse)
def update_program_content(
    program_id: int,
    program_in: ProgramCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    for var, value in vars(program_in).items():
        setattr(program, var, value) if value is not None else None
        
    db.commit()
    db.refresh(program)
    return program

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.role == "user").all()

@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/media")
def list_media_files(
    current_admin: User = Depends(get_current_admin)
):
    if not os.path.exists(settings.UPLOAD_DIR):
        return []
    
    files = []
    for f in os.listdir(settings.UPLOAD_DIR):
        path = os.path.join(settings.UPLOAD_DIR, f)
        if os.path.isfile(path):
            files.append({
                "name": f,
                "url": f"/uploads/{f}",
                "size": os.path.getsize(path),
                "modified_at": os.path.getmtime(path)
            })
    return files

@router.delete("/media/{filename}")
def delete_media_file(
    filename: str,
    current_admin: User = Depends(get_current_admin)
):
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
        
    os.remove(filepath)
    return {"message": f"File {filename} deleted successfully"}
