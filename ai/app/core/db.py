import logging
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.POSTGRES_URI,
    pool_pre_ping=True,
    echo=False,  # Set to True for debugging SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Create all tables defined in Base metadata.
    Safe to call multiple times (idempotent).
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Chat history tables created (if not already exist).")
    except Exception as e:
        logger.error(f"Failed to create chat history tables: {e}")
        raise