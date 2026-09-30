"""
MongoDB connection + collection accessors.
Uses Motor (async) driver — compatible with FastAPI's async event loop.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo import IndexModel, ASCENDING, DESCENDING
from core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )
    return _client


def get_db():
    return get_client()["truetrace"]


def get_analyses_collection() -> AsyncIOMotorCollection:
    return get_db()["analyses"]


def get_stats_collection() -> AsyncIOMotorCollection:
    return get_db()["stats"]


async def init_indexes() -> None:
    """
    Creates indexes on startup.
    Safe to call multiple times — MongoDB ignores duplicate index creation.
    """
    analyses = get_analyses_collection()

    indexes = [
        # Fast lookup by file hash (deduplication + cache)
        IndexModel([("fileHash", ASCENDING)], name="fileHash_idx"),
        # Sort analyses by date (dashboard / history queries)
        IndexModel([("uploadedAt", DESCENDING)], name="uploadedAt_idx"),
        # Filter by verdict
        IndexModel([("verdict", ASCENDING)], name="verdict_idx"),
        # Shareable report token lookup
        IndexModel(
            [("shareToken", ASCENDING)],
            name="shareToken_idx",
            sparse=True,  # only index docs that have a shareToken
        ),
    ]

    await analyses.create_indexes(indexes)
    logger.info("MongoDB indexes ensured on 'analyses' collection")


async def close_connection() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
