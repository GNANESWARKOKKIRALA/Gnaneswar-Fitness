from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import Program
from app.schemas.schemas import ProgramResponse, ProgramCreate
from app.api.deps import get_current_admin

router = APIRouter(prefix="/programs", tags=["programs"])

@router.get("", response_model=List[ProgramResponse])
def get_programs(db: Session = Depends(get_db)):
    return db.query(Program).all()

@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(program_id: int, db: Session = Depends(get_db)):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    return program

@router.post("", response_model=ProgramResponse)
def create_program(
    program_in: ProgramCreate,
    current_admin: Program = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_program = Program(**program_in.dict())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program
