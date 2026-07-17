import requests
from app.core.config import settings

def call_groq_api(prompt: str) -> str:
    if not settings.GROQ_API_KEY:
        raise ValueError("Groq API key not set")
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama3-8b-8192",  # Default stable Groq model
        "messages": [
            {
                "role": "system",
                "content": "You are a professional elite bodybuilding and diet coach. Generate detailed, structured plans. Use markdown."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=15)
    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.text}")
        
    result = response.json()
    return result["choices"][0]["message"]["content"]

def generate_mock_workout_plan(goal: str, level: str, equipment: str) -> str:
    return f"""# Custom Workout Plan
**Goal:** {goal.upper()}
**Level:** {level.upper()}
**Equipment:** {equipment.upper()}

---

## Weekly Schedule
- **Monday:** Push Day (Chest, Shoulders, Triceps)
- **Tuesday:** Pull Day (Back, Biceps)
- **Wednesday:** Active Recovery / Core
- **Thursday:** Leg Day (Quads, Hamstrings, Calves)
- **Friday:** Arm & Shoulder Hypertrophy
- **Saturday:** Light Cardio / Stretch
- **Sunday:** Rest Day

---

## Detailed Routines

### Monday: Push Day
1. **Incline Barbell Bench Press** - 4 sets x 8-10 reps (RPE 8)
2. **Dumbbell Shoulder Press** - 3 sets x 10-12 reps
3. **Flat Dumbbell Flyes** - 3 sets x 12-15 reps (focused squeeze)
4. **Lateral Raises** - 4 sets x 15 reps (drop set on last set)
5. **Tricep Overhead Extensions** - 3 sets x 12 reps

### Tuesday: Pull Day
1. **Deadlifts / Rack Pulls** - 4 sets x 5 reps (Strength Focus)
2. **Lat Pulldowns** - 3 sets x 8-12 reps (controlled negative)
3. **Seated Cable Rows** - 3 sets x 10-12 reps
4. **Face Pulls** - 4 sets x 15 reps (rotator cuff health)
5. **Incline Alternating Dumbbell Curls** - 3 sets x 10-12 reps
6. **Hammer Curls** - 3 sets x 12-15 reps

### Thursday: Leg Day
1. **Barbell Back Squats** - 4 sets x 6-8 reps
2. **Romanian Deadlifts** - 4 sets x 8-10 reps (hamstring stretch focus)
3. **Leg Press** - 3 sets x 12-15 reps
4. **Leg Extensions** - 3 sets x 15-20 reps (pump)
5. **Seated Calf Raises** - 4 sets x 15 reps (2 second pause at bottom)

---

## Coach's Notes
- Focus on progressive overload: try to increase weight or reps every week.
- Keep rest periods between 90-120 seconds for compound lifts, 60 seconds for isolation lifts.
- Stay hydrated and track your workouts!
"""

def generate_mock_diet_plan(goal: str, diet_type: str, target_calories: int) -> str:
    # Estimate macro splits
    if goal.lower() == "fat loss":
        protein = int(target_calories * 0.40 / 4)
        carbs = int(target_calories * 0.35 / 4)
        fats = int(target_calories * 0.25 / 9)
    elif goal.lower() == "muscle gain":
        protein = int(target_calories * 0.30 / 4)
        carbs = int(target_calories * 0.50 / 4)
        fats = int(target_calories * 0.20 / 9)
    else:
        protein = int(target_calories * 0.30 / 4)
        carbs = int(target_calories * 0.40 / 4)
        fats = int(target_calories * 0.30 / 9)

    return f"""# Custom Diet Plan
**Goal:** {goal.upper()}
**Diet Type:** {diet_type.upper()}
**Target Calories:** {target_calories} kcal

---

## Daily Macro Targets
- **Protein:** {protein}g (~{protein * 4} kcal)
- **Carbs:** {carbs}g (~{carbs * 4} kcal)
- **Fats:** {fats}g (~{fats * 9} kcal)

---

## Sample Meal Plan

### Meal 1: Breakfast (08:00 AM)
- 4 Egg Whites + 2 Whole Eggs (or Scrambled Tofu for Vegetarian)
- 75g Rolled Oats (dry weight) cooked in water
- 100g Blueberries
- 1 cup Black Coffee / Green Tea

### Meal 2: Mid-Morning Snack (11:30 AM)
- 1 scoop Whey Protein Isolate (or Vegan Protein Blend)
- 30g Almonds or Cashews
- 1 medium Apple

### Meal 3: Lunch (02:00 PM)
- 150g Grilled Chicken Breast (or Paneer/Tempeh for Vegetarian)
- 150g cooked Basmati Rice / Quinoa
- 100g Steamed Broccoli & Zucchini
- 1 tbsp Olive Oil (drizzled)

### Meal 4: Pre-Workout (05:00 PM)
- 1 Large Banana
- 2 slices Whole Wheat Toast
- 1 tbsp Natural Peanut Butter

### Meal 5: Dinner (08:30 PM)
- 150g Grilled Salmon / White Fish (or Lentils/Soya chunks for Vegetarian)
- 150g Baked Sweet Potato
- Mixed Green Salad with Lemon dressing

---

## Hydration & Supplementation
- **Water:** Drink 3-4 liters of water daily.
- **Creatine Monohydrate:** 5g daily (anytime).
- **Multivitamin:** 1 tablet with breakfast.
- **Omega-3 Fish Oil:** 2 capsules with dinner.
"""
