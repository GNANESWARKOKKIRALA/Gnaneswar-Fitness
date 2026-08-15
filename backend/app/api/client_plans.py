from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.database import get_db
from app.models.models import (
    User, ClientWorkout, ClientWorkoutExercise, 
    ClientDiet, ClientDietFood, ClientSchedule, Exercise, DietItem
)
from app.schemas.schemas import (
    ClientWorkoutCreate, ClientWorkoutResponse,
    ClientDietCreate, ClientDietResponse,
    ClientScheduleBase, ClientScheduleResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/client-plans", tags=["Client Plans"])

# ==========================================
# SCHEDULE
# ==========================================
@router.get("/{user_id}/schedule", response_model=ClientScheduleResponse)
def get_client_schedule(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    schedule = db.query(ClientSchedule).filter(ClientSchedule.user_id == user_id).first()
    if not schedule:
        # Return default schedule if not found
        schedule = ClientSchedule(user_id=user_id)
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
    return schedule

@router.put("/{user_id}/schedule", response_model=ClientScheduleResponse)
def update_client_schedule(
    user_id: int,
    schedule_data: ClientScheduleBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    schedule = db.query(ClientSchedule).filter(ClientSchedule.user_id == user_id).first()
    if not schedule:
        schedule = ClientSchedule(user_id=user_id, **schedule_data.model_dump())
        db.add(schedule)
    else:
        for key, value in schedule_data.model_dump().items():
            setattr(schedule, key, value)
            
    db.commit()
    db.refresh(schedule)
    return schedule

# ==========================================
# WORKOUTS
# ==========================================
@router.get("/{user_id}/workouts", response_model=List[ClientWorkoutResponse])
def get_client_workouts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(ClientWorkout).filter(ClientWorkout.user_id == user_id).all()

@router.put("/{user_id}/workouts", response_model=List[ClientWorkoutResponse])
def update_client_workouts(
    user_id: int,
    workouts_data: List[ClientWorkoutCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Clear existing workouts for this user
    db.query(ClientWorkout).filter(ClientWorkout.user_id == user_id).delete()
    
    new_workouts = []
    for w_data in workouts_data:
        workout = ClientWorkout(
            user_id=user_id,
            day_of_week=w_data.day_of_week,
            title=w_data.title
        )
        db.add(workout)
        db.flush() # To get the workout id
        
        for ex_data in w_data.exercises:
            exercise = ClientWorkoutExercise(
                workout_id=workout.id,
                **ex_data.model_dump()
            )
            db.add(exercise)
        new_workouts.append(workout)
        
    db.commit()
    
    return db.query(ClientWorkout).filter(ClientWorkout.user_id == user_id).all()

# ==========================================
# DIETS
# ==========================================
@router.get("/{user_id}/diets", response_model=List[ClientDietResponse])
def get_client_diets(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(ClientDiet).filter(ClientDiet.user_id == user_id).order_by(ClientDiet.display_order).all()

@router.put("/{user_id}/diets", response_model=List[ClientDietResponse])
def update_client_diets(
    user_id: int,
    diets_data: List[ClientDietCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Clear existing diets for this user
    db.query(ClientDiet).filter(ClientDiet.user_id == user_id).delete()
    
    new_diets = []
    for d_data in diets_data:
        diet = ClientDiet(
            user_id=user_id,
            meal_time=d_data.meal_time,
            instructions=d_data.instructions,
            display_order=d_data.display_order
        )
        db.add(diet)
        db.flush()
        
        for f_data in d_data.foods:
            food = ClientDietFood(
                diet_id=diet.id,
                **f_data.model_dump()
            )
            db.add(food)
        new_diets.append(diet)
        
    db.commit()
    
    return db.query(ClientDiet).filter(ClientDiet.user_id == user_id).order_by(ClientDiet.display_order).all()

