from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from app.models.database import get_db
from app.models.models import AssignedPlan, User
from app.schemas.schemas import AssignedPlanCreate, AssignedPlanResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.get("/me", response_model=List[AssignedPlanResponse])
def get_my_assigned_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AssignedPlan).filter(AssignedPlan.user_id == current_user.id).all()

@router.get("/client/{user_id}", response_model=List[AssignedPlanResponse])
def get_client_assigned_plans(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(AssignedPlan).filter(AssignedPlan.user_id == user_id).all()

@router.post("", response_model=AssignedPlanResponse, status_code=201)
def assign_plan(
    plan_in: AssignedPlanCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Verify user exists
    user = db.query(User).filter(User.id == plan_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    date_assigned = plan_in.date_assigned if plan_in.date_assigned else datetime.utcnow().date()
    
    db_plan = AssignedPlan(
        user_id=plan_in.user_id,
        template_id=plan_in.template_id,
        title=plan_in.title,
        description=plan_in.description,
        type=plan_in.type,
        content=plan_in.content,
        file_url=plan_in.file_url,
        schedule_type=plan_in.schedule_type,
        date_assigned=date_assigned
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/{plan_id}", response_model=AssignedPlanResponse)
def update_assigned_plan(
    plan_id: int,
    plan_in: AssignedPlanCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_plan = db.query(AssignedPlan).filter(AssignedPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Assigned plan not found")
        
    for var, value in vars(plan_in).items():
        setattr(db_plan, var, value) if value is not None else None
        
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/{plan_id}")
def delete_assigned_plan(
    plan_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_plan = db.query(AssignedPlan).filter(AssignedPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Assigned plan not found")
        
    db.delete(db_plan)
    db.commit()
    return {"message": "Plan unassigned successfully"}
