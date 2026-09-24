import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import initialize_database
from app.routes.summary import router as summary_router
from app.routes.voice import router as voice_router
from app.routes.interviews import router as interviews_router
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router

# Initialize database schema safely without modifying existing records
initialize_database()

app = FastAPI(title="HeritageAI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(summary_router)
app.include_router(voice_router)
app.include_router(interviews_router)
app.include_router(chat_router)
app.include_router(auth_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "running",
        "message": "HeritageAI Backend Running 🚀"
    }

# Mount Frontend Static Files at Root '/' (Must be mounted AFTER all API routes)
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")