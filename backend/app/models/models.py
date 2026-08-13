from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user") # 'user' or 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    progress_entries = relationship("ProgressEntry", back_populates="user")

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    type = Column(String, nullable=False) # 'workout', 'diet', 'both'
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="program")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    amount = Column(Float, nullable=False)
    screenshot_url = Column(String, nullable=True)
    status = Column(String, default="pending") # 'pending', 'under_review', 'approved', 'rejected'
    reject_reason = Column(String, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    program = relationship("Program", back_populates="orders")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class ClientTransformation(Base):
    __tablename__ = "client_transformations"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    before_img = Column(String, nullable=False)
    after_img = Column(String, nullable=False)
    video_url = Column(String, nullable=True)
    story = Column(Text, nullable=False)
    duration = Column(String, nullable=True, default="12 Weeks")
    before_weight = Column(String, nullable=True)
    after_weight = Column(String, nullable=True)
    goal = Column(String, nullable=True, default="fat loss") # 'fat loss', 'muscle gain', etc.
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MyTransformation(Base):
    __tablename__ = "my_transformations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    story = Column(Text, nullable=False)
    before_img = Column(String, nullable=False)
    after_img = Column(String, nullable=False)
    after_img_2 = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    duration = Column(String, nullable=True, default="24 Weeks")
    before_weight = Column(String, nullable=True)
    after_weight = Column(String, nullable=True)
    category = Column(String, nullable=True, default="Bodybuilding Prep")
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TransformationVideo(Base):
    __tablename__ = "transformation_videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    client_name = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    video_url = Column(String, nullable=False)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Transformation(Base):
    __tablename__ = "transformations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    before_img = Column(String, nullable=False)
    after_img = Column(String, nullable=False)
    story = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    weight = Column(Float, nullable=False)
    measurements = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress_entries")

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    body = Column(Text, nullable=False)
    cover_img = Column(String, nullable=True)
    category = Column(String, nullable=True, default="Bodybuilding")
    tags = Column(String, nullable=True, default="fitness,nutrition")
    author = Column(String, nullable=True, default="Gnaneswar Kokkirala")
    is_published = Column(Boolean, default=True)
    published_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    type = Column(String, nullable=False, default="image") # 'image', 'video', 'pdf'
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class WebsiteSetting(Base):
    __tablename__ = "website_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PlanTemplate(Base):
    __tablename__ = "plan_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False) # 'workout' or 'diet'
    content = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AssignedPlan(Base):
    __tablename__ = "assigned_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("plan_templates.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    schedule_type = Column(String, default="daily")
    date_assigned = Column(Date, default=datetime.utcnow().date)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    workout_completed = Column(Boolean, default=False)
    meals_completed = Column(Integer, default=0)
    water_intake_ml = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    weight = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
