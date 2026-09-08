"""SQLAlchemy engine, session factory, and FastAPI dependency.

The engine is built from `settings.database_url` (loaded from `.env`). A reachable
PostgreSQL server is required before the backend starts; `init_db()` creates the
schema on first boot.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from src.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # transparently recover from dropped connections
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

Base = declarative_base()


def init_db() -> None:
    """Creates all tables. Safe to call repeatedly (idempotent)."""
    # Import models so they register on Base.metadata before create_all.
    from backend.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency yielding a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
