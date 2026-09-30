from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str = ""

    # Redis (Upstash)
    upstash_redis_url: str = ""

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # App
    app_env: str = "development"
    app_version: str = "1.0.0"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
