"""
MongoDB connection + collection accessors.
Uses Motor (async) driver — compatible with FastAPI's async event loop.
"""
import re
from urllib.parse import quote_plus
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo import IndexModel, ASCENDING, DESCENDING
from core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

_client: AsyncIOMotorClient | None = None


def _safe_uri(uri: str) -> str:
    """
    Safely encodes username and password in MongoDB URI.
    Uses rfind('@') to handle passwords that contain '@' symbols.
    """
    if "://" not in uri:
        return uri
    protocol, rest = uri.split("://", 1)
    at_index = rest.rfind("@")
    if at_index == -1:
        return uri
    credentials = rest[:at_index]
    host_part   = rest[at_index:]
    colon_index = credentials.find(":")
    if colon_index == -1:
        return uri
    username = credentials[:colon_index]
    password = credentials[colon_index + 1:]
    return f"{protocol}://{quote_plus(username)}:{quote_plus(password)}{host_part}"


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        safe_uri = _safe_uri(settings.mongodb_uri)
        _client = AsyncIOMotorClient(
            safe_uri,
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
        IndexModel([("fileHash", ASCENDING)],  name="fileHash_idx"),
        IndexModel([("uploadedAt", DESCENDING)], name="uploadedAt_idx"),
        IndexModel([("verdict", ASCENDING)],    name="verdict_idx"),
        IndexModel([("shareToken", ASCENDING)], name="shareToken_idx", sparse=True),
    ]

    await analyses.create_indexes(indexes)
    logger.info("MongoDB indexes ensured on 'analyses' collection")


async def close_connection() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")

