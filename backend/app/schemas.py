from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ---------- Existing Interview schemas (updated) ----------

class InterviewBase(BaseModel):
    elder_name: str
    age: Optional[int] = None
    village_or_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    language: str
    transcript: str
    ai_summary: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewOut(InterviewBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- New User / Auth schemas ----------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
