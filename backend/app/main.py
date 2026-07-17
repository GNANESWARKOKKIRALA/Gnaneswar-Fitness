import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.models.database import engine, Base
from app.api import auth, programs, orders, admin, ai, progress, contact, templates, assignments, logs, chat, announcements, transformations
from app.core.config import settings

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bodybuilding Coaching Platform API",
    description="Backend API services for user auth, programs, orders, AI planner, and progress tracking.",
    version="1.0.0"
)

# CORS configuration
# Next.js defaults to port 3000. Let's allow localhost on ports 3000, 3001, and general localhost origins.
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Serve uploaded screenshots/files statically
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bodybuilding Coaching Platform API is running.",
        "docs_url": "/docs"
    }
