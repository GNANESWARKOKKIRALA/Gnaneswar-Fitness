from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime, date

# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Login schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Program schemas
class ProgramBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    type: str # 'workout', 'diet', 'both'
    pdf_url: Optional[str] = None
    display_order: Optional[int] = 0

class ProgramCreate(ProgramBase):
    pass

class ProgramResponse(ProgramBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    plan_id: int
    amount: float

class OrderCreate(OrderBase):
    pass

class OrderResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    amount: float
    screenshot_url: Optional[str] = None
    status: str
    reject_reason: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    program: Optional[ProgramResponse] = None

    class Config:
        from_attributes = True

class OrderRejectRequest(BaseModel):
    reason: str

# Progress Entry schemas
class ProgressEntryBase(BaseModel):
    date: date
    weight: float
    measurements: Optional[str] = None
    photo_url: Optional[str] = None

class ProgressEntryCreate(ProgressEntryBase):
    pass

class ProgressEntryResponse(ProgressEntryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Client Transformation Schemas
class ClientTransformationBase(BaseModel):
    client_name: Optional[str] = "Client"
    before_img: Optional[str] = None
    after_img: Optional[str] = None
    video_url: Optional[str] = None
    story: Optional[str] = ""
    duration: Optional[str] = "12 Weeks"
    before_weight: Optional[str] = None
    after_weight: Optional[str] = None
    goal: Optional[str] = "fat loss"
    is_published: bool = True
    display_order: Optional[int] = 0

class ClientTransformationCreate(ClientTransformationBase):
    pass

class ClientTransformationResponse(ClientTransformationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# My Transformation Schemas
class MyTransformationBase(BaseModel):
    title: Optional[str] = "Transformation"
    story: Optional[str] = ""
    before_img: Optional[str] = None
    after_img: Optional[str] = None
    after_img_2: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[str] = "24 Weeks"
    before_weight: Optional[str] = None
    after_weight: Optional[str] = None
    category: Optional[str] = "Bodybuilding Prep"
    is_published: bool = True
    display_order: Optional[int] = 0

class MyTransformationCreate(MyTransformationBase):
    pass

class MyTransformationResponse(MyTransformationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Transformation Video Schemas
class TransformationVideoBase(BaseModel):
    title: Optional[str] = "Transformation Video"
    description: Optional[str] = None
    client_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = ""
    is_published: bool = True
    display_order: Optional[int] = 0

class TransformationVideoCreate(TransformationVideoBase):
    pass

class TransformationVideoResponse(TransformationVideoBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Legacy Transformation schema
class TransformationBase(BaseModel):
    before_img: Optional[str] = None
    after_img: Optional[str] = None
    story: Optional[str] = ""
    is_public: bool = True

class TransformationResponse(TransformationBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Blog Post schemas
class BlogPostBase(BaseModel):
    title: Optional[str] = "Blog Post"
    slug: Optional[str] = None
    body: Optional[str] = ""
    cover_img: Optional[str] = None
    category: Optional[str] = "Bodybuilding"
    tags: Optional[str] = "fitness,nutrition"
    author: Optional[str] = "Gnaneswar Kokkirala"
    is_published: bool = True
    display_order: Optional[int] = 0

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostResponse(BlogPostBase):
    id: int
    slug: Optional[str] = "post"
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Media Asset schemas
class MediaAssetBase(BaseModel):
    filename: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    type: str = "image"

class MediaAssetResponse(MediaAssetBase):
    id: int
    uploaded_by: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Website Setting schemas
class WebsiteSettingBase(BaseModel):
    key: str
    value: Optional[str] = None

class WebsiteSettingResponse(WebsiteSettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# CMS content & contact schemas
class CMSContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    type: Optional[str] = None
    pdf_url: Optional[str] = None

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# Plan Template schemas
class PlanTemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    content: str
    file_url: Optional[str] = None

class PlanTemplateResponse(PlanTemplateCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Assigned Plan schemas
class AssignedPlanCreate(BaseModel):
    user_id: int
    template_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    type: str
    content: str
    file_url: Optional[str] = None
    schedule_type: Optional[str] = "daily"
    date_assigned: Optional[date] = None

class AssignedPlanResponse(AssignedPlanCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Daily Log schemas
class DailyLogCreate(BaseModel):
    date: date
    workout_completed: Optional[bool] = False
    meals_completed: Optional[int] = 0
    water_intake_ml: Optional[int] = 0
    notes: Optional[str] = None
    weight: Optional[float] = None

class DailyLogResponse(DailyLogCreate):
    id: Optional[int] = None
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Chat Message schemas
class ChatMessageCreate(BaseModel):
    receiver_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Announcement schemas
class AnnouncementCreate(BaseModel):
    title: str
    content: str

class AnnouncementResponse(AnnouncementCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Structured Workout Schemas
class ExerciseBase(BaseModel):
    name: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    default_sets: Optional[str] = None
    default_reps: Optional[str] = None
    default_rest: Optional[str] = None
    instructions: Optional[str] = None
    difficulty: Optional[str] = None
    target_muscle: Optional[str] = None
    tips: Optional[str] = None
    display_order: Optional[int] = 0

class ExerciseResponse(ExerciseBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True

class WorkoutCategoryBase(BaseModel):
    name: str
    display_order: Optional[int] = 0

class WorkoutCategoryResponse(WorkoutCategoryBase):
    id: int
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True

class ClientWorkoutExerciseBase(BaseModel):
    exercise_id: int
    sets: Optional[str] = None
    reps: Optional[str] = None
    rest_time: Optional[str] = None
    instructions: Optional[str] = None
    display_order: Optional[int] = 0

class ClientWorkoutExerciseResponse(ClientWorkoutExerciseBase):
    id: int
    workout_id: int
    exercise: ExerciseResponse

    class Config:
        from_attributes = True

class ClientWorkoutBase(BaseModel):
    day_of_week: str
    title: Optional[str] = None

class ClientWorkoutExerciseCreate(BaseModel):
    exercise_id: int
    sets: Optional[str] = None
    reps: Optional[str] = None
    rest_time: Optional[str] = None
    instructions: Optional[str] = None
    display_order: Optional[int] = 0

class ClientWorkoutCreate(ClientWorkoutBase):
    exercises: List[ClientWorkoutExerciseCreate] = []

class ClientWorkoutResponse(ClientWorkoutBase):
    id: int
    user_id: int
    exercises: List[ClientWorkoutExerciseResponse] = []

    class Config:
        from_attributes = True

# Structured Diet Schemas
class DietItemBase(BaseModel):
    name: str
    calories: Optional[float] = 0.0
    protein: Optional[float] = 0.0
    carbs: Optional[float] = 0.0
    fats: Optional[float] = 0.0
    display_order: Optional[int] = 0

class DietItemResponse(DietItemBase):
    id: int

    class Config:
        from_attributes = True

class ClientDietFoodBase(BaseModel):
    diet_item_id: int
    quantity: Optional[str] = None
    display_order: Optional[int] = 0

class ClientDietFoodResponse(ClientDietFoodBase):
    id: int
    diet_id: int
    diet_item: DietItemResponse

    class Config:
        from_attributes = True

class ClientDietBase(BaseModel):
    meal_time: str
    instructions: Optional[str] = None
    display_order: Optional[int] = 0

class ClientDietFoodCreate(BaseModel):
    diet_item_id: int
    quantity: Optional[str] = None
    display_order: Optional[int] = 0

class ClientDietCreate(ClientDietBase):
    foods: List[ClientDietFoodCreate] = []

class ClientDietResponse(ClientDietBase):
    id: int
    user_id: int
    foods: List[ClientDietFoodResponse] = []

    class Config:
        from_attributes = True

# Client Schedule
class ClientScheduleBase(BaseModel):
    water_target_ml: Optional[int] = 3000
    sleep_target_hrs: Optional[int] = 8
    cardio_target: Optional[str] = None
    steps_target: Optional[int] = 10000
    supplements: Optional[str] = None
    daily_instructions: Optional[str] = None

class ClientScheduleResponse(ClientScheduleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Reordering Schema
class ReorderItem(BaseModel):
    id: int
    display_order: int

class ReorderRequest(BaseModel):
    items: List[ReorderItem]
