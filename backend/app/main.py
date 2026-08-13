import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.models.database import engine, Base
from app.api import auth, programs, orders, admin, ai, progress, contact, templates, assignments, logs, chat, announcements, transformations, client_transformations, my_transformations, transformation_videos, blogs, settings_api
from app.core.config import settings

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bodybuilding Coaching Platform API",
    description="Backend API services for user auth, programs, orders, AI planner, and progress tracking.",
    version="1.0.0"
)

# CORS configuration - Allow local and production origins dynamically
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(programs.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(announcements.router, prefix="/api")
app.include_router(transformations.router, prefix="/api")
app.include_router(client_transformations.router, prefix="/api")
app.include_router(my_transformations.router, prefix="/api")
app.include_router(transformation_videos.router, prefix="/api")
app.include_router(blogs.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

# Serve Next.js static exported frontend
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "out"))

# Mount Next.js build assets subfolder for direct high-performance serving (if directory exists)
if os.path.exists(os.path.join(frontend_dir, "_next")):
    app.mount("/_next", StaticFiles(directory=os.path.join(frontend_dir, "_next")), name="next-assets")

@app.get("/{path:path}")
def serve_frontend(path: str):
    # Prevent catching API, uploads, or next asset requests
    if path.startswith("api") or path.startswith("uploads") or path.startswith("_next"):
        return {"detail": "Not Found"}

    # Dynamic fallback check in case directory is not present
    if not os.path.exists(frontend_dir):
        if not path:
            return {
                "status": "online",
                "message": "Bodybuilding Coaching Platform API is running. (Frontend build folder not found)",
                "docs_url": "/docs"
            }
        return {"detail": "Not Found"}

    file_path = os.path.join(frontend_dir, path)

    # Serve root page
    if not path:
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    # Serve static file if it exists directly (e.g. coach.jpg, favicon.ico)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Serve matching clean URL .html file (e.g. /login -> login.html)
    html_path = f"{file_path}.html"
    if os.path.isfile(html_path):
        return FileResponse(html_path)

    # Serve subdirectory index (e.g. /transformations/ -> transformations/index.html)
    index_path = os.path.join(file_path, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)

    # Fallback to 404.html or index.html
    fallback_404 = os.path.join(frontend_dir, "404.html")
    if os.path.isfile(fallback_404):
        return FileResponse(fallback_404, status_code=404)

    return FileResponse(os.path.join(frontend_dir, "index.html"))
