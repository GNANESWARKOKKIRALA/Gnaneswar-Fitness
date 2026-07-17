from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import aiofiles
from app.models.database import get_db
from app.models.models import Transformation, User
from app.schemas.schemas import TransformationResponse
from app.api.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/transformations", tags=["transformations"])

@router.get("", response_model=List[TransformationResponse])
def get_transformations(db: Session = Depends(get_db)):
    return db.query(Transformation).filter(Transformation.is_public == True).all()

@router.post("", response_model=TransformationResponse, status_code=201)
async def create_transformation(
    story: str = Form(...),
    before_img_file: UploadFile = File(...),
    after_img_file: UploadFile = File(...),
    after_img_file_2: Optional[UploadFile] = File(None),
    is_public: bool = Form(True),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save before image
    before_ext = os.path.splitext(before_img_file.filename)[1].lower()
    before_filename = f"before_{uuid.uuid4()}{before_ext}"
    before_filepath = os.path.join(settings.UPLOAD_DIR, before_filename)
    async with aiofiles.open(before_filepath, "wb") as buffer:
        while chunk := await before_img_file.read(1024 * 1024):
            await buffer.write(chunk)
            
    # Save after image
    after_ext = os.path.splitext(after_img_file.filename)[1].lower()
    after_filename = f"after_{uuid.uuid4()}{after_ext}"
    after_filepath = os.path.join(settings.UPLOAD_DIR, after_filename)
    async with aiofiles.open(after_filepath, "wb") as buffer:
        while chunk := await after_img_file.read(1024 * 1024):
            await buffer.write(chunk)

    # Save optional second after image
    after2_url = None
    if after_img_file_2:
        after2_ext = os.path.splitext(after_img_file_2.filename)[1].lower()
        after2_filename = f"after2_{uuid.uuid4()}{after2_ext}"
        after2_filepath = os.path.join(settings.UPLOAD_DIR, after2_filename)
        async with aiofiles.open(after2_filepath, "wb") as buffer:
            while chunk := await after_img_file_2.read(1024 * 1024):
                await buffer.write(chunk)
        after2_url = f"/uploads/{after2_filename}"

    final_story = story
    if after2_url:
        try:
            import json
            parsed = json.loads(story)
            parsed['after_img_2'] = after2_url
            final_story = json.dumps(parsed)
        except Exception:
            pass

    db_trans = Transformation(
        before_img=f"/uploads/{before_filename}",
        after_img=f"/uploads/{after_filename}",
        story=final_story,
        is_public=is_public
    )
    db.add(db_trans)
    db.commit()
    db.refresh(db_trans)
    return db_trans

@router.delete("/{trans_id}")
def delete_transformation(
    trans_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    trans = db.query(Transformation).filter(Transformation.id == trans_id).first()
    if not trans:
        raise HTTPException(status_code=404, detail="Transformation not found")
        
    db.delete(trans)
    db.commit()
    return {"message": "Transformation deleted successfully"}
