from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from app.models.database import get_db
from app.models.models import MyTransformation, User
from app.schemas.schemas import MyTransformationResponse
from app.api.deps import get_current_admin
from app.services.media_service import save_uploaded_media

router = APIRouter(prefix="/my-transformations", tags=["my_transformations"])

@router.get("", response_model=List[MyTransformationResponse])
def get_my_transformations(
    all_records: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(MyTransformation)
    if not all_records:
        query = query.filter(MyTransformation.is_published == True)
    return query.order_by(MyTransformation.created_at.desc()).all()

@router.post("", response_model=MyTransformationResponse, status_code=201)
async def create_my_transformation(
    title: str = Form(...),
    story: str = Form(...),
    duration: Optional[str] = Form("24 Weeks"),
    before_weight: Optional[str] = Form("60 kg"),
    after_weight: Optional[str] = Form("70 kg"),
    category: Optional[str] = Form("Bodybuilding Prep"),
    is_published: bool = Form(True),
    before_img_file: Optional[UploadFile] = File(None),
    after_img_file: Optional[UploadFile] = File(None),
    after_img_2_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    before_img_url: Optional[str] = Form(None),
    after_img_url: Optional[str] = Form(None),
    after_img_2_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    final_before = before_img_url or ""
    final_after = after_img_url or ""
    final_after2 = after_img_2_url or None
    final_video = video_url or None

    if before_img_file:
        res = await save_uploaded_media(before_img_file, "my_before")
        final_before = res["url"]
    if after_img_file:
        res = await save_uploaded_media(after_img_file, "my_after_front")
        final_after = res["url"]
    if after_img_2_file:
        res = await save_uploaded_media(after_img_2_file, "my_after_side")
        final_after2 = res["url"]
    if video_file:
        res = await save_uploaded_media(video_file, "my_transformation_video")
        final_video = res["url"]

    if not final_before or not final_after:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Before image and After image are required."
        )

    trans = MyTransformation(
        title=title,
        story=story,
        before_img=final_before,
        after_img=final_after,
        after_img_2=final_after2,
        video_url=final_video,
        duration=duration,
        before_weight=before_weight,
        after_weight=after_weight,
        category=category,
        is_published=is_published
    )
    db.add(trans)
    db.commit()
    db.refresh(trans)
    return trans

@router.put("/{trans_id}", response_model=MyTransformationResponse)
async def update_my_transformation(
    trans_id: int,
    title: Optional[str] = Form(None),
    story: Optional[str] = Form(None),
    duration: Optional[str] = Form(None),
    before_weight: Optional[str] = Form(None),
    after_weight: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    before_img_file: Optional[UploadFile] = File(None),
    after_img_file: Optional[UploadFile] = File(None),
    after_img_2_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    before_img_url: Optional[str] = Form(None),
    after_img_url: Optional[str] = Form(None),
    after_img_2_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(MyTransformation).filter(MyTransformation.id == trans_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="My Transformation record not found")

    if title is not None:
        item.title = title
    if story is not None:
        item.story = story
    if duration is not None:
        item.duration = duration
    if before_weight is not None:
        item.before_weight = before_weight
    if after_weight is not None:
        item.after_weight = after_weight
    if category is not None:
        item.category = category
    if is_published is not None:
        item.is_published = is_published

    if before_img_url is not None:
        item.before_img = before_img_url
    if after_img_url is not None:
        item.after_img = after_img_url
    if after_img_2_url is not None:
        item.after_img_2 = after_img_2_url
    if video_url is not None:
        item.video_url = video_url

    if before_img_file:
        res = await save_uploaded_media(before_img_file, "my_before")
        item.before_img = res["url"]
    if after_img_file:
        res = await save_uploaded_media(after_img_file, "my_after_front")
        item.after_img = res["url"]
    if after_img_2_file:
        res = await save_uploaded_media(after_img_2_file, "my_after_side")
        item.after_img_2 = res["url"]
    if video_file:
        res = await save_uploaded_media(video_file, "my_transformation_video")
        item.video_url = res["url"]

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{trans_id}")
def delete_my_transformation(
    trans_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(MyTransformation).filter(MyTransformation.id == trans_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="My Transformation record not found")

    db.delete(item)
    db.commit()
    return {"message": "My Transformation record deleted successfully"}
