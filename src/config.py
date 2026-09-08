"""Central configuration for Poker Coach ChromaDB & Ingestion Pipeline."""

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load .env from the project root so DATABASE_URL / GEMINI_API_KEY are available
# regardless of the working directory the backend or CLI is launched from.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Base Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = PROJECT_ROOT / "Books"
DATA_DIR = PROJECT_ROOT / "data"
CHROMA_DIR = DATA_DIR / "chroma_db"
BM25_PATH = DATA_DIR / "bm25_index.pkl"
MANIFEST_PATH = DATA_DIR / "ingestion_manifest.json"
KNOWLEDGE_BASE_PATH = DATA_DIR / "poker_knowledge_base.json"


class Settings(BaseModel):
    # Paths
    project_root: Path = PROJECT_ROOT
    books_dir: Path = BOOKS_DIR
    data_dir: Path = DATA_DIR
    chroma_dir: Path = CHROMA_DIR
    bm25_path: Path = BM25_PATH
    manifest_path: Path = MANIFEST_PATH
    knowledge_base_path: Path = KNOWLEDGE_BASE_PATH

    # Compatibility properties
    @property
    def BOOKS_DIR(self) -> Path:
        return self.books_dir

    @property
    def DATA_DIR(self) -> Path:
        return self.data_dir

    @property
    def CHROMA_DIR(self) -> Path:
        return self.chroma_dir

    @property
    def BM25_PATH(self) -> Path:
        return self.bm25_path

    @property
    def MANIFEST_PATH(self) -> Path:
        return self.manifest_path

    # ChromaDB
    collection_name: str = "poker_books"

    # Embedding settings
    embedding_provider: str = Field(default_factory=lambda: os.getenv("EMBEDDING_PROVIDER", "local"))
    local_embedding_model: str = Field(default_factory=lambda: os.getenv("LOCAL_EMBEDDING_MODEL", "BAAI/bge-base-en-v1.5"))
    gemini_api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    # conv.md: "Gemini API using the user-selected Gemini Flash 3.6 model/version"
    gemini_model: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-3.6-flash"))

    # Chunking parameters (paragraph-based: one paragraph = one chunk, no overlap).
    # Short paragraphs are kept as independent chunks (never merged); only tiny
    # whitespace/junk fragments below min_chunk_length are discarded. Oversized
    # paragraphs are split on sentence boundaries so they stay within the
    # embedding model's context window.
    min_chunk_length: int = 30  # discard tiny whitespace/junk fragments
    max_chunk_chars: int = 1200  # split paragraphs longer than this on sentence boundaries

    # Hybrid Retrieval (from conv.md: 5 vector + 5 BM25, best 5 by 70/30 weight)
    vector_top_k: int = 5
    bm25_top_k: int = 5
    final_top_k: int = 5
    vector_weight: float = 0.70
    bm25_weight: float = 0.30

    # Ingestion batching
    batch_size: int = 250

    # PostgreSQL persistence (per-user opponent + hand data). Read from .env.
    database_url: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg2://postgres:postgres@localhost:5432/poker_coach",
        )
    )


class DemoUser(BaseModel):
    username: str
    display_name: str


# The only three logins the app accepts. Each gets its own isolated,
# preloaded data set (seeded on startup). No signup / OAuth (conv.md).
DEMO_USERS: List[DemoUser] = [
    DemoUser(username="demo1", display_name="Alex (Demo)"),
    DemoUser(username="demo2", display_name="Bailey (Demo)"),
    DemoUser(username="demo3", display_name="Casey (Demo)"),
]


# Global settings instance
settings = Settings()

# Ensure required directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)
