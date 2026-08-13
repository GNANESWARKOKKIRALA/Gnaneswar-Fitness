import os
import uuid
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO_EXTS = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB

async def save_uploaded_media(file: UploadFile, custom_filename: str = None) -> dict:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1].lower()
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
        
    is_image = ext in ALLOWED_IMAGE_EXTS
    is_video = ext in ALLOWED_VIDEO_EXTS
    
    # Generate clean filename
    if custom_filename and custom_filename.strip():
        safe_name = os.path.basename(custom_filename.strip())
        name_part, custom_ext = os.path.splitext(safe_name)
        filename = f"{name_part}_{uuid.uuid4().hex[:6]}{ext}"
    else:
        filename = f"media_{uuid.uuid4().hex}{ext}"
        
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Read file content
    contents = await file.read()
    file_size = len(contents)
    
    # Size check
    if is_image and file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size ({file_size / (1024*1024):.1f}MB) exceeds limit of 15MB"
        )
    if is_video and file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Video size ({file_size / (1024*1024):.1f}MB) exceeds limit of 100MB"
        )
        
    # Compress & save image if applicable
    if is_image:
        try:
            import io
            image = Image.open(io.BytesIO(contents))
            
            # Convert RGBA to RGB for JPEG saving if needed
            if image.mode in ("RGBA", "P") and ext in (".jpg", ".jpeg"):
                image = image.convert("RGB")
                
            # Resize if dimensions are extremely large (>2500px)
            max_dimension = 2500
            if max(image.width, image.height) > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                
            # Save compressed file
            if ext in (".jpg", ".jpeg"):
                image.save(filepath, format="JPEG", quality=85, optimize=True)
            elif ext == ".png":
                image.save(filepath, format="PNG", optimize=True)
            elif ext == ".webp":
                image.save(filepath, format="WEBP", quality=85)
            else:
                with open(filepath, "wb") as f:
                    f.write(contents)
        except Exception:
            # Fallback to direct file write if PIL fails
            with open(filepath, "wb") as f:
                f.write(contents)
    else:
        # Save video directly
        with open(filepath, "wb") as f:
            f.write(contents)
            
    actual_size = os.path.getsize(filepath) if os.path.exists(filepath) else file_size
    media_type = "image" if is_image else ("video" if is_video else "file")
    
    return {
        "filename": filename,
        "url": f"/uploads/{filename}",
        "filepath": filepath,
        "file_size": actual_size,
        "mime_type": file.content_type,
        "type": media_type
    }
