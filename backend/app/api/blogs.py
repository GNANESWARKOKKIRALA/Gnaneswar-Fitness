from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import re
from datetime import datetime
from app.models.database import get_db
from app.models.models import BlogPost, User
from app.schemas.schemas import BlogPostResponse
from app.api.deps import get_current_admin
from app.services.media_service import save_uploaded_media

router = APIRouter(prefix="/blogs", tags=["blogs"])

def generate_slug(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug or "post"

@router.get("", response_model=List[BlogPostResponse])
def get_blogs(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    all_records: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(BlogPost)
    if not all_records:
        query = query.filter(BlogPost.is_published == True)
        
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (BlogPost.title.ilike(term)) | (BlogPost.body.ilike(term)) | (BlogPost.tags.ilike(term))
        )
        
    if category and category.strip() and category.lower() != "all":
        query = query.filter(BlogPost.category.ilike(category.strip()))

    return query.order_by(BlogPost.published_at.desc()).all()

@router.get("/{slug_or_id}", response_model=BlogPostResponse)
def get_single_blog(
    slug_or_id: str,
    db: Session = Depends(get_db)
):
    if slug_or_id.isdigit():
        post = db.query(BlogPost).filter(BlogPost.id == int(slug_or_id)).first()
    else:
        post = db.query(BlogPost).filter(BlogPost.slug == slug_or_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@router.post("", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    title: str = Form(...),
    body: str = Form(...),
    category: Optional[str] = Form("Bodybuilding"),
    tags: Optional[str] = Form("fitness,nutrition"),
    author: Optional[str] = Form("Gnaneswar Kokkirala"),
    is_published: bool = Form(True),
    cover_img_file: Optional[UploadFile] = File(None),
    cover_img_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    final_cover = cover_img_url or None
    if cover_img_file:
        res = await save_uploaded_media(cover_img_file, f"blog_{title[:10]}")
        final_cover = res["url"]

    # Generate unique slug
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 1
    while db.query(BlogPost).filter(BlogPost.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = BlogPost(
        title=title,
        slug=slug,
        body=body,
        cover_img=final_cover,
        category=category,
        tags=tags,
        author=author,
        is_published=is_published,
        published_at=datetime.utcnow()
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: int,
    title: Optional[str] = Form(None),
    body: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    cover_img_file: Optional[UploadFile] = File(None),
    cover_img_url: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    if title is not None and title != post.title:
        post.title = title
        # Update slug
        base_slug = generate_slug(title)
        slug = base_slug
        counter = 1
        while db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.id != post_id).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        post.slug = slug

    if body is not None:
        post.body = body
    if category is not None:
        post.category = category
    if tags is not None:
        post.tags = tags
    if author is not None:
        post.author = author
    if is_published is not None:
        post.is_published = is_published
    if cover_img_url is not None:
        post.cover_img = cover_img_url

    if cover_img_file:
        res = await save_uploaded_media(cover_img_file, f"blog_{post.id}")
        post.cover_img = res["url"]

    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_blog_post(
    post_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db.delete(post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
