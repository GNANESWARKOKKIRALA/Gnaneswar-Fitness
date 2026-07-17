from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from app.models.database import get_db
from app.models.models import DailyLog, User
from app.schemas.schemas import DailyLogCreate, DailyLogResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/me", response_model=DailyLogResponse)
def get_my_daily_log(
    date_val: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == date_val
    ).first()
    
    if not log:
        # Return an empty log defaults
        return DailyLog(
            user_id=current_user.id,
            date=date_val,
            workout_completed=False,
            meals_completed=0,
            water_intake_ml=0,
            notes="",
            weight=None
        )
    return log

@router.post("/me", response_model=DailyLogResponse)
def create_or_update_daily_log(
    log_in: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == log_in.date
    ).first()
    
    if not log:
        log = DailyLog(
            user_id=current_user.id,
            date=log_in.date,
            workout_completed=log_in.workout_completed or False,
            meals_completed=log_in.meals_completed or 0,
            water_intake_ml=log_in.water_intake_ml or 0,
            notes=log_in.notes,
            weight=log_in.weight
        )
        db.add(log)
    else:
        log.workout_completed = log_in.workout_completed if log_in.workout_completed is not None else log.workout_completed
        log.meals_completed = log_in.meals_completed if log_in.meals_completed is not None else log.meals_completed
        log.water_intake_ml = log_in.water_intake_ml if log_in.water_intake_ml is not None else log.water_intake_ml
        log.notes = log_in.notes if log_in.notes is not None else log.notes
        log.weight = log_in.weight if log_in.weight is not None else log.weight
        
    db.commit()
    db.refresh(log)
    return log

@router.get("/client/{user_id}", response_model=List[DailyLogResponse])
def get_client_logs(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(DailyLog).filter(DailyLog.user_id == user_id).order_by(DailyLog.date.desc()).all()
