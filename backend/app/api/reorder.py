from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.models.database import get_db
from app.models.models import (
    ClientTransformation, MyTransformation, TransformationVideo,
    BlogPost, Program, Exercise, ClientWorkoutExercise, 
    DietItem, ClientDietFood, HomepageSection
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/reorder", tags=["Reorder"])

class ReorderItem(BaseModel):
    id: int
    display_order: int

class ReorderRequest(BaseModel):
    table: str
    items: List[ReorderItem]

TABLE_MAP = {
    "client_transformations": ClientTransformation,
    "my_transformations": MyTransformation,
    "transformation_videos": TransformationVideo,
    "blog_posts": BlogPost,
    "programs": Program,
    "exercises": Exercise,
    "client_workout_exercises": ClientWorkoutExercise,
    "diet_items": DietItem,
    "client_diet_foods": ClientDietFood,
    "homepage_sections": HomepageSection
}

@router.post("/")
def update_order(
    request: ReorderRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    model = TABLE_MAP.get(request.table)
    if not model:
        raise HTTPException(status_code=400, detail="Invalid table name")

    try:
        # We process in a batch
        for item in request.items:
            # For tables that might use string IDs (like homepage_sections), this might need adjustment,
            # but homepage_sections has an integer `id` primary key so it works.
            db_item = db.query(model).filter(model.id == item.id).first()
            if db_item:
                db_item.display_order = item.display_order
        
        db.commit()
        return {"message": "Reorder successful"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
