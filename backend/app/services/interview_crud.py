from sqlalchemy.orm import Session
from app.models.interview import Interview
from app.schemas import InterviewCreate


def create_interview(db: Session, interview: InterviewCreate, user_id: int) -> Interview:
    db_interview = Interview(**interview.dict(), user_id=user_id)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


def get_interviews_for_user(db: Session, user_id: int):
    return (
        db.query(Interview)
        .filter(Interview.user_id == user_id)
        .order_by(Interview.created_at.desc())
        .all()
    )


def get_interview_by_id(db: Session, interview_id: int, user_id: int):
    return (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == user_id)
        .first()
    )


def delete_interview(db: Session, interview_id: int, user_id: int) -> bool:
    interview = get_interview_by_id(db, interview_id, user_id)
    if not interview:
        return False
    db.delete(interview)
    db.commit()
    return True