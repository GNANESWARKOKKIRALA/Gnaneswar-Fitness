from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from app.models.database import get_db
from app.models.models import ClientTransformation, User
from app.schemas.schemas import ClientTransformationResponse
from app.api.deps import get_current_admin
from app.services.media_service import save_uploaded_media

router = APIRouter(prefix="/client-transformations", tags=["client_transformations"])

@router.get("/public-stats")
def get_public_stats(db: Session = Depends(get_db)):
    clients_count = db.query(User).filter(User.role == "user").count()
    transformations_count = db.query(ClientTransformation).filter(ClientTransformation.is_published == True).count()
    return {
        "clients_count": clients_count,
        "transformations_count": transformations_count,
        "display_clients": clients_count
    }

@router.get("", response_model=List[ClientTransformationResponse])
def get_client_transformations(
    all_records: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(ClientTransformation)
    if not all_records:
        query = query.filter(ClientTransformation.is_published == True)
    return query.order_by(ClientTransformation.created_at.desc()).all()

@router.post("", response_model=ClientTransformationResponse, status_code=201)
async def create_client_transformation(
    client_name: str = Form(...),
    story: str = Form(...),
    duration: Optional[str] = Form("12 Weeks"),
    before_weight: Optional[str] = Form(None),
    after_weight: Optional[str] = Form(None),
    goal: Optional[str] = Form("fat loss"),
    is_published: bool = Form(True),
    before_img_file: Optional[UploadFile] = File(None),
    after_img_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    before_img_url: Optional[str] = Form(None),
    after_img_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    final_before_img = before_img_url or ""
    final_after_img = after_img_url or ""
    final_video_url = video_url or None

    if before_img_file:
        res = await save_uploaded_media(before_img_file, f"before_{client_name}")
        final_before_img = res["url"]
        
    if after_img_file:
        res = await save_uploaded_media(after_img_file, f"after_{client_name}")
        final_after_img = res["url"]

    if video_file:
        res = await save_uploaded_media(video_file, f"video_{client_name}")
        final_video_url = res["url"]

    if not final_before_img or not final_after_img:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Before image and After image are required."
        )

    transformation = ClientTransformation(
        client_name=client_name,
        story=story,
        before_img=final_before_img,
        after_img=final_after_img,
        video_url=final_video_url,
        duration=duration,
        before_weight=before_weight,
        after_weight=after_weight,
        goal=goal,
        is_published=is_published
    )
    db.add(transformation)
    db.commit()
    db.refresh(transformation)
    return transformation

@router.put("/{trans_id}", response_model=ClientTransformationResponse)
async def update_client_transformation(
    trans_id: int,
    client_name: Optional[str] = Form(None),
    story: Optional[str] = Form(None),
    duration: Optional[str] = Form(None),
    before_weight: Optional[str] = Form(None),
    after_weight: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    before_img_file: Optional[UploadFile] = File(None),
    after_img_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    before_img_url: Optional[str] = Form(None),
    after_img_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(ClientTransformation).filter(ClientTransformation.id == trans_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Client transformation not found")

    if client_name is not None:
        item.client_name = client_name
    if story is not None:
        item.story = story
    if duration is not None:
        item.duration = duration
    if before_weight is not None:
        item.before_weight = before_weight
    if after_weight is not None:
        item.after_weight = after_weight
    if goal is not None:
        item.goal = goal
    if is_published is not None:
        item.is_published = is_published

    if before_img_url is not None:
        item.before_img = before_img_url
    if after_img_url is not None:
        item.after_img = after_img_url
    if video_url is not None:
        item.video_url = video_url

    if before_img_file:
        res = await save_uploaded_media(before_img_file, f"before_{item.client_name}")
        item.before_img = res["url"]
    if after_img_file:
        res = await save_uploaded_media(after_img_file, f"after_{item.client_name}")
        item.after_img = res["url"]
    if video_file:
        res = await save_uploaded_media(video_file, f"video_{item.client_name}")
        item.video_url = res["url"]

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{trans_id}")
def delete_client_transformation(
    trans_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(ClientTransformation).filter(ClientTransformation.id == trans_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Client transformation not found")

    db.delete(item)
    db.commit()
    return {"message": "Client transformation deleted successfully"}
