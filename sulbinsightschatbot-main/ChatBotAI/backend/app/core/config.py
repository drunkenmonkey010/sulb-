import logging
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):

    MODEL_NAME: str = "gemini-2.0-flash-001"
    GEMINI_API_KEY: str
    GEMINI_RAG_KEY: str

    class Config:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"


settings = Settings()

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
