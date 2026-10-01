"""
Rate limiting + result caching via Upstash Redis.

Rate limit : 10 analyses per IP per hour (sliding window)
Result cache: SHA-256 hash of image bytes → cache for 24 hours
              (same image uploaded twice skips re-processing)
"""
import hashlib
import json
import logging
from fastapi import Request, HTTPException
from core.redis_client import get_redis

logger = logging.getLogger(__name__)

RATE_LIMIT_MAX     = 10        # max requests
RATE_LIMIT_WINDOW  = 3600      # seconds (1 hour)
CACHE_TTL          = 86400     # seconds (24 hours)


def _ip_key(ip: str) -> str:
    return f"truetrace:rate:{ip}"


def _cache_key(file_hash: str) -> str:
    return f"truetrace:cache:{file_hash}"


async def check_rate_limit(request: Request) -> dict:
    """
    Sliding-window rate limiter.
    Returns headers dict with rate limit info.
    Raises HTTP 429 if limit exceeded.
    If Redis is unavailable, silently allows the request through.
    """
    redis = await get_redis()
    if redis is None:
        return {}  # no Redis → no rate limiting (fail open)

    # Prefer X-Forwarded-For (set by Render / Vercel proxies)
    forwarded = request.headers.get("X-Forwarded-For")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host or "unknown")

    key = _ip_key(ip)
    try:
        count = await redis.incr(key)
        if count == 1:
            # First request in window — set expiry
            await redis.expire(key, RATE_LIMIT_WINDOW)

        ttl = await redis.ttl(key)
        remaining = max(0, RATE_LIMIT_MAX - count)

        if count > RATE_LIMIT_MAX:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Rate limit exceeded. You can analyze up to {RATE_LIMIT_MAX} "
                    f"images per hour. Try again in {ttl} seconds."
                ),
                headers={
                    "X-RateLimit-Limit":     str(RATE_LIMIT_MAX),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset":     str(ttl),
                    "Retry-After":           str(ttl),
                },
            )

        return {
            "X-RateLimit-Limit":     str(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset":     str(ttl),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Rate limit check failed (fail open): {e}")
        return {}


async def get_cached_result(image_bytes: bytes) -> tuple[str | None, dict | None]:
    """
    Checks Redis for a cached analysis result for this exact image.
    Returns (file_hash, cached_result_dict) or (file_hash, None) on miss.
    """
    file_hash = hashlib.sha256(image_bytes).hexdigest()
    redis = await get_redis()
    if redis is None:
        return file_hash, None

    try:
        cached = await redis.get(_cache_key(file_hash))
        if cached:
            logger.info(f"Cache HIT for {file_hash[:12]}...")
            return file_hash, json.loads(cached)
    except Exception as e:
        logger.warning(f"Cache read failed: {e}")

    return file_hash, None


async def cache_result(file_hash: str, result_dict: dict) -> None:
    """Stores an analysis result in Redis for 24 hours."""
    redis = await get_redis()
    if redis is None:
        return

    try:
        # Don't cache the large base64 debug images to save Redis memory
        slim = {k: v for k, v in result_dict.items() if k != "debugImages"}
        await redis.setex(_cache_key(file_hash), CACHE_TTL, json.dumps(slim))
        logger.info(f"Cached result for {file_hash[:12]}...")
    except Exception as e:
        logger.warning(f"Cache write failed: {e}")
