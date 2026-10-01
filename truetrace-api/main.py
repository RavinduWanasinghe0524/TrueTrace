"""
TrueTrace API — FastAPI entry point
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import get_settings
from core.redis_client import get_redis, close_redis
from db.mongo import close_connection, init_indexes
from routers.analyze import router as analyze_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"TrueTrace API v{settings.app_version} starting ({settings.app_env})")

    # MongoDB indexes (non-fatal if fails)
    try:
        await init_indexes()
        logger.info("MongoDB indexes ready")
    except Exception as e:
        logger.warning(f"MongoDB index init failed (non-fatal): {e}")

    # Redis connection (optional)
    await get_redis()

    yield

    await close_redis()
    await close_connection()
    logger.info("TrueTrace API shut down cleanly")


app = FastAPI(
    title="TrueTrace API",
    description="AI-powered photo forensics backend by IronLogix",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/health", tags=["health"])
async def health():
    redis = await get_redis()
    return {
        "status":  "ok",
        "version": settings.app_version,
        "env":     settings.app_env,
        "redis":   "connected" if redis else "not configured",
    }
