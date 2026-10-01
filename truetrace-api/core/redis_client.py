"""
Redis client for Upstash (free tier).
Gracefully degrades if Redis is not configured.
"""
import logging
import redis.asyncio as aioredis
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis: aioredis.Redis | None = None
_redis_ok: bool = False          # simple flag — avoids truthiness check on Redis object


async def get_redis() -> aioredis.Redis | None:
    """Returns an async Redis client, or None if not configured."""
    global _redis, _redis_ok

    if _redis_ok and _redis is not None:
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
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        await _redis.ping()
        _redis_ok = True
        logger.info("Connected to Upstash Redis")
        return _redis
    except Exception as e:
        logger.warning(f"Redis connection failed (non-fatal): {e}")
        _redis = None
        _redis_ok = False
        return None


def redis_status() -> str:
    """Returns 'connected' or 'not configured' — safe for health checks."""
    return "connected" if _redis_ok else "not configured"


async def close_redis() -> None:
    global _redis, _redis_ok
    if _redis:
        await _redis.aclose()
        _redis = None
        _redis_ok = False
        logger.info("Redis connection closed")
