from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    elder_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    village_or_city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    language = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())