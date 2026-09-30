"""
TrueTrace API — FastAPI entry point
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import get_settings
from db.mongo import close_connection, init_indexes
from routers.analyze import router as analyze_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info(f"TrueTrace API v{settings.app_version} starting ({settings.app_env})")
    await init_indexes()
    yield
    await close_connection()
    logger.info("TrueTrace API shut down cleanly")


app = FastAPI(
    title="TrueTrace API",
    description="AI-powered photo forensics backend by IronLogix",
    version=settings.app_version,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(analyze_router)


# ── Health Check ─────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "version": settings.app_version,
        "env": settings.app_env,
    }
