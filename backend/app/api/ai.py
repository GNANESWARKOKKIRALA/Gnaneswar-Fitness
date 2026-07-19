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

def get_local_chat_reply(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ["hello", "hi", "hey", "greetings"]):
        return (
            "### Welcome to the Enterprise AI Coaching Hub!\n\n"
            "Hello! I am your **AI Bodybuilding & Diet Coach**. I am equipped with advanced models to analyze your training "
            "metrics, recovery cycles, and diet protocols. Here is what we can do:\n"
            "- **Autoregulate Lifts:** Log your sets in the AI Autoregulator to get instant loading suggestions based on RPE.\n"
            "- **CGM Bio-Nutrition:** Ingest meals to simulate blood glucose curves and test vegan/keto ingredient swaps.\n"
            "- **Somatic Recovery:** Map your muscle tightness in the Recovery Hub to generate rehabilitation routines and cycle contrast timers.\n"
            "- **Commitment Stakes:** Staged wagers with SweatTokens in the Gamification tab.\n\n"
            "What would you like to discuss today? Ask me about exercises, diets, supplements, or recovery!"
        )
    elif any(k in msg for k in ["bench", "chest", "push", "press", "pec"]):
        return (
            "### Elite Chest Training Blueprint\n\n"
            "To maximize chest hypertrophy (specifically focusing on upper and lower pectoralis fibers):\n\n"
            "1. **Upper Chest Clavicular Head:** Incorporate **Incline Barbell or Dumbbell Press** set at a 30-degree incline. Higher angles shift the load onto the front deltoids.\n"
            "2. **Rotator Cuff Protection:** Keep your scapula retracted (pulled back) and depressed (pulled down) against the bench. Do not flare your elbows past 75 degrees.\n"
            "3. **Hypertrophy Rep Range:** Target 3-4 sets of 8-12 reps ending at RPE 8-9.\n\n"
            "**Coach's Tip:** Log your chest sets in the **AI Autoregulator Hub** right now to track cumulative chest fatigue on the heat map!"
        )
    elif any(k in msg for k in ["squat", "leg", "quad", "hamstring", "calf", "deadlift"]):
        return (
            "### High-Intensity Leg & Lower Body Protocol\n\n"
            "Building powerful quadriceps and hamstrings requires deep mechanical tension and eccentric control:\n\n"
            "- **Quadriceps:** Prioritize **Barbell Back Squats** or **Leg Press** with a full range of motion (hip crease below parallel) and a controlled 3-second negative.\n"
            "- **Hamstrings:** Incorporate **Romanian Deadlifts (RDLs)**. Keep the bar close to your thighs, hinge at the hips, and maintain a neutral spine to stretch the hamstrings under load.\n"
            "- **Calves:** Perform calf raises with a strict **2-second stretch** at the bottom and a peak contraction at the top. Calves respond best to high frequency and strict form.\n\n"
            "**Fatigue Alert:** Leg training heavily drains your central nervous system (CNS). Monitor your autonomic score in the **Recovery Hub** tomorrow morning!"
        )
    elif any(k in msg for k in ["back", "row", "pull", "lat", "pulldown"]):
        return (
            "### Back Width & Thickness Programming\n\n"
            "The back consists of multiple complex muscle groups (lats, trapezius, rhomboids, rear delts). Optimize your training:\n\n"
            "1. **Lat Width:** Focus on vertical pulls like **Wide-Grip Lat Pulldowns** or **Weighted Pull-ups**. Drive with your elbows and squeeze at the bottom.\n"
            "2. **Mid-Back Thickness:** Focus on horizontal pulling like **Seated Cable Rows** or **T-Bar Rows**, focusing on scapular retraction at peak squeeze.\n"
            "3. **Eccentric Focus:** Avoid using momentum. Control the stretch portion of each row to cause micro-tears in the muscle fibers.\n\n"
            "**Coaching Tip:** Make sure you perform foam rolling resets for lat tightness in your somatic recovery dashboard after pull days."
        )
    elif any(k in msg for k in ["diet", "calorie", "protein", "nutrition", "meal", "carb", "fat"]):
        return (
            "### Scientific Nutrition & Macro Targets\n\n"
            "To support lean mass synthesis and metabolic health, structure your macros as follows:\n\n"
            "- **Protein Intake:** Target **1.6 to 2.2 grams of protein per kilogram** of lean body mass. Distribute this across 4-5 servings to maintain muscle protein synthesis (MPS).\n"
            "- **Energy Balance:** Maintain a caloric surplus of 200-300 kcal for lean gains, or a deficit of 300-500 kcal for fat loss.\n"
            "- **CGM Tracking:** Carbs are critical for gym performance. Try entering your breakfast or pre-workout meal in the **Bio-Nutrition CGM Dashboard** to model glucose responses and prevent insulin crashes during heavy squats.\n"
            "- **Bioswapping:** Try swapping standard dishes to Keto/Vegan formats in the diet tab to automatically optimize your macro counters."
        )
    elif any(k in msg for k in ["creatine", "supplement", "vitamin", "omega"]):
        return (
            "### Supplementation Stack for Natural Athletes\n\n"
            "Maximize your biological performance with these evidence-backed compounds:\n\n"
            "1. **Creatine Monohydrate:** Take **5g daily** consistently. It increases muscle cell hydration and phosphocreatine stores, directly improving ATP generation during heavy lifting sets.\n"
            "2. **Whey/Vegan Protein Isolate:** Convenient way to meet daily target proteins. Best ingested post-workout or in between meals.\n"
            "3. **Omega-3 Fatty Acids:** 2-3g daily to combat joint inflammation and support cardiovascular recovery.\n"
            "4. **Vitamin D3 & K2:** Critical for bone density and natural testosterone/hormone synthesis."
        )
    elif any(k in msg for k in ["sleep", "recovery", "hrv", "sauna", "plunge", "somatic", "sore"]):
        return (
            "### Autonomic Recovery & Nervous System Optimization\n\n"
            "Muscle growth does not occur in the gym—it occurs during deep recovery states:\n\n"
            "- **Sleep Latency & Deep Sleep:** Aim for 8 hours of sleep with at least 20% in deep sleep staging. Focus on limiting blue-light exposure 90 minutes before bed to maximize melatonin release.\n"
            "- **HRV (Heart Rate Variability):** A higher HRV indicates a dominant parasympathetic nervous system (rest-and-digest). Monitor your Readiness Score in the **Recovery Hub** tab.\n"
            "- **Thermal Contrast Therapy:** Cycle through **15 minutes of Hot Sauna** followed by **3 minutes of Cold Plunge** using our interactive timers to flush out metabolic waste and boost endorphins."
        )
    elif any(k in msg for k in ["token", "sweattoken", "wallet", "reward", "redeem"]):
        return (
            "### SweatToken (ST) Rewards System\n\n"
            "Your consistency is now a redeemable digital asset! Here is how to utilize your tokens:\n\n"
            "- **Earn Tokens:** Get **15 ST** for every set you log in the AI Autoregulator, and **10 ST** for generating and completing somatic drills in the Recovery Hub.\n"
            "- **Commitment Stakes:** Activate an **Anti-Sloth Commitment Contract** in the Gamification Hub. Pledge 50 or 100 ST against a weekly workout goal. Doubling your tokens upon target completion!\n"
            "- **Redeem Rewards:** Navigate to the **Rewards Shop** inside the Gamification tab to exchange your SweatTokens for custom meal swaps, shaker bottles, video form reviews, or 1-on-1 coaching calls with Coach Gnaneswar."
        )
    else:
        return (
            "### AI Fitness Coach Assistant\n\n"
            "I've received your query. To give you a scientific, highly structured bodybuilding answer, please configure your **GROQ_API_KEY** in the backend configuration settings.\n\n"
            "In the meantime, feel free to ask me questions specifically about:\n"
            "- **Push/Chest training** rules\n"
            "- **Leg/Lower body** squat mechanics\n"
            "- **Back/Pull** hypertrophy routines\n"
            "- **Diet & Calorie** macro targets\n"
            "- **Creatine & Supplement** stack schedules\n"
            "- **Recovery, HRV, Sauna** protocols\n"
            "- **SweatToken** wallet balances and rewards"
        )

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
        return {"reply": get_local_chat_reply(request.message)}
        
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
            return {"reply": get_local_chat_reply(request.message)}
        result = response.json()
        return {"reply": result["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"reply": get_local_chat_reply(request.message)}

