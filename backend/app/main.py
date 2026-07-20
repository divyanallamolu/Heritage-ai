from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import initialize_database
from app.routes.summary import router as summary_router
from app.routes.voice import router as voice_router
from app.routes.interviews import router as interviews_router
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router

# Initialize database
initialize_database()

app = FastAPI(title="HeritageAI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local Development
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",

        # Render Frontend
        "https://heritage-ai-4.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(summary_router)
app.include_router(voice_router)
app.include_router(interviews_router)
app.include_router(chat_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "status": "running",
        "message": "HeritageAI Backend Running 🚀"
    }