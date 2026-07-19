from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.summary import router as summary_router
from app.routes.voice import router as voice_router
from app.routes.interviews import router as interviews_router
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router
from app.database import Base, engine, initialize_database
from app.models.interview import Interview
from app.models.user import User

initialize_database()

app = FastAPI(title="HeritageAI API")

# Ensure the database schema matches the current SQLAlchemy models.
initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router)
app.include_router(voice_router)
app.include_router(interviews_router)
app.include_router(chat_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "HeritageAI Backend Running 🚀"}