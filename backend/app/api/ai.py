from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
import requests
from app.core.config import settings
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

class AIChatRequest(BaseModel):
    message: str
    history: List[dict] = []

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

@router.post("/chat")
def chat_with_ai_coach(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = (
        "You are an elite bodybuilding and diet coach. Answer the user's fitness, diet, and training questions in detail. "
        "Keep your tone highly motivating, professional, and scientific. Use markdown."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": request.message})
    
    if not settings.GROQ_API_KEY:
        return {
            "reply": "I am your AI Coach. To enable fully customized real-time replies, please configure the GROQ_API_KEY in the backend server. How can I help you today?"
        }
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama3-8b-8192",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 800
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code != 200:
            return {"reply": f"AI Coach: I encountered an issue connecting to the model. Detail: {response.text}"}
        result = response.json()
        return {"reply": result["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"reply": f"AI Coach: Connection failed. Detail: {str(e)}"}
