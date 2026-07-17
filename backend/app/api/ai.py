from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.models.models import User
from app.services.ai_service import call_groq_api, generate_mock_workout_plan, generate_mock_diet_plan

router = APIRouter(prefix="/ai", tags=["ai"])

class WorkoutPlanRequest(BaseModel):
    goal: str
    level: str
    equipment: str

class DietPlanRequest(BaseModel):
    goal: str
    diet_type: str
    target_calories: int

@router.post("/workout-plan")
def get_ai_workout_plan(
    request: WorkoutPlanRequest,
    current_user: User = Depends(get_current_user)
):
    # Construct Groq prompt
    prompt = (
        f"Create a detailed, high-performance bodybuilding workout plan for a {request.level} lifter. "
        f"Their goal is {request.goal}. "
        f"They have access to the following equipment: {request.equipment}. "
        f"Provide a weekly schedule, exercises, sets, reps, rest times, and coaching tips."
    )
    
    try:
        plan = call_groq_api(prompt)
        return {"plan": plan, "source": "groq_api"}
    except Exception as e:
        # Fallback to local generator
        plan = generate_mock_workout_plan(request.goal, request.level, request.equipment)
        return {"plan": plan, "source": "local_mock_fallback", "detail": str(e)}

@router.post("/diet-plan")
def get_ai_diet_plan(
    request: DietPlanRequest,
    current_user: User = Depends(get_current_user)
):
    # Construct Groq prompt
    prompt = (
        f"Create a structured, detailed diet and nutrition plan. "
        f"Goal: {request.goal}. "
        f"Diet Type: {request.diet_type}. "
        f"Daily Target Calories: {request.target_calories} kcal. "
        f"Provide macro breakdowns, a sample meal plan with 4-5 meals, and supplement recommendations."
    )
    
    try:
        plan = call_groq_api(prompt)
        return {"plan": plan, "source": "groq_api"}
    except Exception as e:
        # Fallback to local generator
        plan = generate_mock_diet_plan(request.goal, request.diet_type, request.target_calories)
        return {"plan": plan, "source": "local_mock_fallback", "detail": str(e)}
