from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import PlanTemplate, User
from app.schemas.schemas import PlanTemplateCreate, PlanTemplateResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", response_model=List[PlanTemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    return db.query(PlanTemplate).all()

@router.post("", response_model=PlanTemplateResponse, status_code=status.HTTP_217_CREATED if hasattr(status, "HTTP_217_CREATED") else 201)
def create_template(
    template_in: PlanTemplateCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_template = PlanTemplate(
        title=template_in.title,
        description=template_in.description,
        type=template_in.type,
        content=template_in.content,
        file_url=template_in.file_url
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/{template_id}", response_model=PlanTemplateResponse)
def update_template(
    template_id: int,
    template_in: PlanTemplateCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_template = db.query(PlanTemplate).filter(PlanTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    for var, value in vars(template_in).items():
        setattr(db_template, var, value) if value is not None else None
        
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_template = db.query(PlanTemplate).filter(PlanTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    db.delete(db_template)
    db.commit()
    return {"message": "Template deleted successfully"}
