"""
Redis client for Upstash (free tier).
Gracefully degrades if Redis is not configured — the API still works,
just without rate limiting or result caching.
"""
import logging
import redis.asyncio as aioredis
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis | None:
    """Returns an async Redis client, or None if not configured."""
    global _redis
    if _redis is not None:
        return _redis

    url = settings.upstash_redis_url.strip()
    if not url:
        logger.warning("UPSTASH_REDIS_URL not set — rate limiting disabled")
        return None

    try:
        _redis = aioredis.from_url(
            url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
        await _redis.ping()
        logger.info("Connected to Upstash Redis")
        return _redis
    except Exception as e:
        logger.warning(f"Redis connection failed (non-fatal): {e}")
        _redis = None
        return None


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
        logger.info("Redis connection closed")
