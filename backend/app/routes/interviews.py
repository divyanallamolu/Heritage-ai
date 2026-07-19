from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import InterviewCreate, InterviewOut
from app.services import interview_crud
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.interview import Interview


def _serialize_library_items(items):
    serialized = []
    for item in items:
        try:
            serialized.append(InterviewOut.model_validate(item).model_dump())
        except Exception:
            serialized.append(
                {
                    "id": getattr(item, "id", None),
                    "user_id": getattr(item, "user_id", None),
                    "elder_name": getattr(item, "elder_name", ""),
                    "age": getattr(item, "age", None),
                    "village_or_city": getattr(item, "village_or_city", None),
                    "district": getattr(item, "district", None),
                    "state": getattr(item, "state", None),
                    "language": getattr(item, "language", ""),
                    "transcript": getattr(item, "transcript", ""),
                    "ai_summary": getattr(item, "ai_summary", None),
                    "created_at": getattr(item, "created_at", None),
                }
            )
    return serialized

router = APIRouter()


@router.post("/interviews", response_model=InterviewOut)
def save_interview(
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return interview_crud.create_interview(db, interview, int(getattr(current_user, "id")))


@router.get("/interviews", response_model=list[InterviewOut])
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return interview_crud.get_interviews_for_user(db, int(getattr(current_user, "id")))


@router.get("/interviews/{interview_id}", response_model=InterviewOut)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = interview_crud.get_interview_by_id(db, interview_id, int(getattr(current_user, "id")))
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.delete("/interviews/{interview_id}")
def remove_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = interview_crud.delete_interview(db, interview_id, int(getattr(current_user, "id")))
    if not deleted:
        raise HTTPException(status_code=404, detail="Interview not found")
    return {"message": "Interview deleted successfully"}
@router.get("/library")
def get_public_library(db: Session = Depends(get_db)):
    """
    Public endpoint — returns ALL interviews from ALL users, no login
    required. This powers the Heritage Library showcase page, which is
    intentionally different from GET /interviews (that one is private,
    per-user, for "My Interviews").
    """
    try:
        items = (
            db.query(Interview)
            .order_by(Interview.created_at.desc())
            .all()
        )
        return _serialize_library_items(items)
    except Exception:
        return []