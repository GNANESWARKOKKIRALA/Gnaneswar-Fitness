from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db
from app.models.models import TransformationVideo, User
from app.schemas.schemas import TransformationVideoResponse
from app.api.deps import get_current_admin
from app.services.media_service import save_uploaded_media

router = APIRouter(prefix="/transformation-videos", tags=["transformation_videos"])

@router.get("", response_model=List[TransformationVideoResponse])
def get_transformation_videos(
    all_records: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(TransformationVideo)
    if not all_records:
        query = query.filter(TransformationVideo.is_published == True)
    return query.order_by(TransformationVideo.created_at.desc()).all()

@router.post("", response_model=TransformationVideoResponse, status_code=201)
async def create_transformation_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    client_name: Optional[str] = Form(None),
    is_published: bool = Form(True),
    video_file: Optional[UploadFile] = File(None),
    thumbnail_file: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    final_video = video_url or ""
    final_thumb = thumbnail_url or None

    if video_file:
        res = await save_uploaded_media(video_file, f"trans_video_{title[:10]}")
        final_video = res["url"]
    if thumbnail_file:
        res = await save_uploaded_media(thumbnail_file, f"thumb_{title[:10]}")
        final_thumb = res["url"]

    if not final_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A video file or video URL is required."
        )

    video_item = TransformationVideo(
        title=title,
        description=description,
        client_name=client_name,
        thumbnail_url=final_thumb,
        video_url=final_video,
        is_published=is_published
    )
    db.add(video_item)
    db.commit()
    db.refresh(video_item)
    return video_item

@router.put("/{video_id}", response_model=TransformationVideoResponse)
async def update_transformation_video(
    video_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    client_name: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    video_file: Optional[UploadFile] = File(None),
    thumbnail_file: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(TransformationVideo).filter(TransformationVideo.id == video_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Transformation video not found")

    if title is not None:
        item.title = title
    if description is not None:
        item.description = description
    if client_name is not None:
        item.client_name = client_name
    if is_published is not None:
        item.is_published = is_published

    if video_url is not None:
        item.video_url = video_url
    if thumbnail_url is not None:
        item.thumbnail_url = thumbnail_url

    if video_file:
        res = await save_uploaded_media(video_file, f"trans_video_{item.id}")
        item.video_url = res["url"]
    if thumbnail_file:
        res = await save_uploaded_media(thumbnail_file, f"thumb_{item.id}")
        item.thumbnail_url = res["url"]

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{video_id}")
def delete_transformation_video(
    video_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(TransformationVideo).filter(TransformationVideo.id == video_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Transformation video not found")

    db.delete(item)
    db.commit()
    return {"message": "Transformation video deleted successfully"}
