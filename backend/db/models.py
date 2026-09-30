"""SQLAlchemy ORM models: users, per-user opponent profiles, per-user hand history.

All opponent/hand data is scoped by `user_id` so the three demo logins never see
each other's data. No bluff fields (that feature was removed).
"""

from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)

    opponents: Mapped[list["OpponentProfileRow"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    hands: Mapped[list["HandRecordRow"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class OpponentProfileRow(Base):
    __tablename__ = "opponent_profiles"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_opponent"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    total_hands: Mapped[int] = mapped_column(Integer, default=1)
    hands_played: Mapped[int] = mapped_column(Integer, default=1)
    vpip_count: Mapped[int] = mapped_column(Integer, default=0)
    pfr_count: Mapped[int] = mapped_column(Integer, default=0)
    cbet_count: Mapped[int] = mapped_column(Integer, default=0)
    cbet_success_count: Mapped[int] = mapped_column(Integer, default=0)
    three_bet_count: Mapped[int] = mapped_column(Integer, default=0)
    three_bet_success_count: Mapped[int] = mapped_column(Integer, default=0)
    fold_to_river_count: Mapped[int] = mapped_column(Integer, default=0)
    called_showdown_count: Mapped[int] = mapped_column(Integer, default=0)
    showdowns_won: Mapped[int] = mapped_column(Integer, default=0)
    showdowns_total: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    last_seen: Mapped[str | None] = mapped_column(String(32), nullable=True)

    user: Mapped["User"] = relationship(back_populates="opponents")


class HandRecordRow(Base):
    __tablename__ = "hand_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    hand_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    street: Mapped[str] = mapped_column(String(16), default="river")
    pot_size: Mapped[float] = mapped_column(Float, default=0.0)
    your_cards: Mapped[list] = mapped_column(JSON, default=list)
    community_cards: Mapped[list] = mapped_column(JSON, default=list)
    result: Mapped[str] = mapped_column(String(8), default="loss")  # win | loss | tie
    amount_won: Mapped[float] = mapped_column(Float, default=0.0)
    action_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    tactical_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[str] = mapped_column(String(32), default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="hands")


class KnowledgeChunkRow(Base):
    """Knowledge chunk table storing canonical poker literature and vector embeddings.
    
    Part of the dual database architecture in Neon PostgreSQL:
    1. Operational relational store: User, OpponentProfileRow, HandRecordRow
    2. AI Knowledge vector store: KnowledgeChunkRow (pgvector 768-d embeddings)
    """
    __tablename__ = "knowledge_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chunk_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    book_title: Mapped[str] = mapped_column(String(512), nullable=False)
    author: Mapped[str] = mapped_column(String(512), nullable=False)
    chapter: Mapped[str] = mapped_column(String(512), nullable=False)
    source_file: Mapped[str] = mapped_column(String(512), default="")
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VisitorLog(Base):
    """Stores incoming platform visits and IP addresses for platform insights.

    Captures unique IP addresses, referrer sources (e.g. LinkedIn, direct),
    visited routes, geolocation headers, user agents, and device breakdowns.
    """
    __tablename__ = "visitor_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ip_address: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    session_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    path: Mapped[str] = mapped_column(String(256), default="/", index=True)
    referrer: Mapped[str | None] = mapped_column(String(512), nullable=True)
    country: Mapped[str | None] = mapped_column(String(64), nullable=True)
    city: Mapped[str | None] = mapped_column(String(64), nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(32), default="desktop")
    browser: Mapped[str | None] = mapped_column(String(64), nullable=True)
    os: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_new_visitor: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

