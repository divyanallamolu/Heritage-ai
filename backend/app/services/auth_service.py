from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas import UserCreate
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token

security_scheme = HTTPBearer()


def register_user(db: Session, user_data: UserCreate) -> User:
    name = " ".join(user_data.name.split())
    email = user_data.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email. Please log in instead.")

    new_user = User(
        name=name,
        email=email,
        hashed_password=hash_password(user_data.password),
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email. Please log in instead.")
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user or not verify_password(password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency used by any protected route. Reads the Bearer token,
    decodes it, and loads the matching user — or raises 401.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user
