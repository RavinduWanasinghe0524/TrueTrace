from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri)
    return _client


def get_db():
    return get_client()["truetrace"]


def get_analyses_collection():
    return get_db()["analyses"]


def get_stats_collection():
    return get_db()["stats"]


async def close_connection():
    global _client
    if _client:
        _client.close()
        _client = None
