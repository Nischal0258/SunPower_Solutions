"""
main.py — FastAPI Application Entry Point for SunPower Solutions
Run with: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import leads, quotes, dispatch, field, warranty, analytics, ai

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified Solar Installation, Inventory, Field Service & Warranty Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware (open for frontend dev on any port) ────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────────────────────
app.include_router(leads.router)
app.include_router(quotes.router)
app.include_router(dispatch.router)
app.include_router(field.router)
app.include_router(warranty.router)
app.include_router(analytics.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "success": True,
        "data": {
            "project": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs": "/docs",
        },
        "message": "SunPower Solutions API is running!",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "sqlite"}
