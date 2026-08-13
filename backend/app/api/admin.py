from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import shutil
from app.models.database import get_db
from app.models.models import Order, User, Program, Transformation
from app.schemas.schemas import OrderResponse, OrderRejectRequest, ProgramResponse, ProgramCreate, UserResponse, UserCreate
from app.api.deps import get_current_admin
from app.core.security import get_password_hash
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
    return db.query(User).filter(User.role != "admin").all()

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
    force: bool = False,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    # Safety check if force is not requested
    if not force:
        rel_url = f"/uploads/{filename}"
        uses = []
        
        # Check ClientTransformations
        from app.models.models import ClientTransformation, MyTransformation, TransformationVideo, BlogPost, WebsiteSetting
        if db.query(ClientTransformation).filter(
            (ClientTransformation.before_img.contains(filename)) |
            (ClientTransformation.after_img.contains(filename)) |
            (ClientTransformation.video_url.contains(filename))
        ).first():
            uses.append("Client Transformations")

        # Check MyTransformations
        if db.query(MyTransformation).filter(
            (MyTransformation.before_img.contains(filename)) |
            (MyTransformation.after_img.contains(filename)) |
            (MyTransformation.after_img_2.contains(filename)) |
            (MyTransformation.video_url.contains(filename))
        ).first():
            uses.append("My Transformations")

        # Check Videos
        if db.query(TransformationVideo).filter(
            (TransformationVideo.thumbnail_url.contains(filename)) |
            (TransformationVideo.video_url.contains(filename))
        ).first():
            uses.append("Transformation Videos")

        # Check Blogs
        if db.query(BlogPost).filter(BlogPost.cover_img.contains(filename)).first():
            uses.append("Blog Posts")

        # Check Settings
        if db.query(WebsiteSetting).filter(WebsiteSetting.value.contains(filename)).first():
            uses.append("Website Settings")

        if uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete file '{filename}' because it is currently used by: {', '.join(uses)}. Remove references first or confirm forced delete."
            )

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
async def upload_media_file(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin)
):
    try:
        from app.services.media_service import save_uploaded_media
        res = await save_uploaded_media(file, custom_name)
        return {
            "name": res["filename"],
            "url": res["url"],
            "size": res["file_size"],
            "modified_at": os.path.getmtime(res["filepath"]) if os.path.exists(res["filepath"]) else 0
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

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

@router.post("/users", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    duplicate = db.query(User).filter(User.email == user_in.email).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Email already in use")
        
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete an admin user")
        
    from app.models.models import AssignedPlan, DailyLog, ProgressEntry
    
    # Delete associated records
    db.query(AssignedPlan).filter(AssignedPlan.user_id == user_id).delete()
    db.query(DailyLog).filter(DailyLog.user_id == user_id).delete()
    db.query(ProgressEntry).filter(ProgressEntry.user_id == user_id).delete()
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/stats")
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from app.models.models import BlogPost, ClientTransformation, TransformationVideo, AssignedPlan
    
    total_clients = db.query(User).filter(User.role == "user").count()
    active_clients = db.query(User).filter(User.role == "user", User.is_active == True).count()
    total_blogs = db.query(BlogPost).count()
    total_transformations = db.query(ClientTransformation).count()
    
    total_workout_plans = db.query(AssignedPlan).filter(AssignedPlan.type == "workout").count()
    total_diet_plans = db.query(AssignedPlan).filter(AssignedPlan.type == "diet").count()
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "total_blogs": total_blogs,
        "total_transformations": total_transformations,
        "total_workout_plans": total_workout_plans,
        "total_diet_plans": total_diet_plans
    }
