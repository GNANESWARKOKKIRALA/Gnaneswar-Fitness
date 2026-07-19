from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import shutil
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

# Schemas for new admin management actions
class RenameMediaRequest(BaseModel):
    new_filename: str

class UserUpdateRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

@router.post("/media")
def upload_media_file(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin)
):
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    if custom_name and custom_name.strip():
        filename = os.path.basename(custom_name.strip())
        _, old_ext = os.path.splitext(file.filename)
        _, new_ext = os.path.splitext(filename)
        if not new_ext:
            filename += old_ext
    else:
        filename = os.path.basename(file.filename)
        
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "name": filename,
        "url": f"/uploads/{filename}",
        "size": os.path.getsize(filepath),
        "modified_at": os.path.getmtime(filepath)
    }

@router.put("/media/{filename}/rename")
def rename_media_file(
    filename: str,
    rename_in: RenameMediaRequest,
    current_admin: User = Depends(get_current_admin)
):
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    old_filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(old_filepath):
        raise HTTPException(status_code=404, detail="File not found")
        
    new_filename = os.path.basename(rename_in.new_filename)
    _, old_ext = os.path.splitext(filename)
    _, new_ext = os.path.splitext(new_filename)
    if not new_ext:
        new_filename += old_ext
    elif new_ext.lower() != old_ext.lower():
        new_filename = os.path.splitext(new_filename)[0] + old_ext
        
    new_filepath = os.path.join(settings.UPLOAD_DIR, new_filename)
    if os.path.exists(new_filepath):
        raise HTTPException(status_code=400, detail="A file with that name already exists")
        
    os.rename(old_filepath, new_filepath)
    return {
        "name": new_filename,
        "url": f"/uploads/{new_filename}"
    }

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_details(
    user_id: int,
    user_in: UserUpdateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.email != user_in.email:
        duplicate = db.query(User).filter(User.email == user_in.email).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Email already in use by another user")
            
    user.name = user_in.name
    user.email = user_in.email
    user.phone = user_in.phone
    
    db.commit()
    db.refresh(user)
    return user
