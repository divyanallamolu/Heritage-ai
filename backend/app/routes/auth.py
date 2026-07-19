from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserLogin, UserOut, TokenResponse
from app.services.auth_service import register_user, authenticate_user, get_current_user
from app.utils.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user_data)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
