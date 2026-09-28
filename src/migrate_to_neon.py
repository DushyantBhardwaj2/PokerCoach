"""Migrate locally stored ChromaDB vector chunks and metadata to Neon PostgreSQL.

Dual Database Architecture:
1. Operational / Relational Store: users, opponent_profiles, hand_records
2. AI Knowledge Vector Store: knowledge_chunks (pgvector enabled, 768-d HNSW index)

This script migrates all chunks (text, metadata, and 768-dim embeddings) from
the local ChromaDB database (data/chroma_db) directly into Neon PostgreSQL.
"""

import os
import sys
import time
from typing import List, Tuple
from pathlib import Path
from dotenv import load_dotenv

# Ensure stdout handles UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

import chromadb
import psycopg2
from psycopg2.extras import execute_values
from src.config import settings


def get_neon_connection():
    db_url = settings.database_url
    if db_url.startswith("postgresql+psycopg2://"):
        db_url = db_url.replace("postgresql+psycopg2://", "postgresql://")
    return psycopg2.connect(db_url)


def ensure_neon_schema(cursor) -> None:
    """Ensures pgvector extension and knowledge_chunks table are present in Neon."""
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_chunks (
            id SERIAL PRIMARY KEY,
            chunk_id VARCHAR(128) UNIQUE NOT NULL,
            book_title VARCHAR(512) NOT NULL,
            author VARCHAR(512) NOT NULL,
            chapter VARCHAR(512) NOT NULL,
            source_file VARCHAR(512) DEFAULT '',
            text TEXT NOT NULL,
            embedding vector(768),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS knowledge_chunks_chunk_id_idx ON knowledge_chunks(chunk_id);
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx 
        ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
    """)


def sanitize_str(val) -> str:
    if val is None:
        return ""
    return str(val).replace("\x00", "")


def format_vector(vec: List[float]) -> str:
    """Formats a list of floats as a PostgreSQL vector literal: [x,y,z]."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def migrate_chroma_to_neon(batch_size: int = 250) -> int:
    chroma_path = settings.chroma_dir
    if not chroma_path.exists():
        print(f"[-] Local ChromaDB directory not found at {chroma_path}")
        return 0

    print(f"[+] Connecting to local ChromaDB at {chroma_path}...")
    client = chromadb.PersistentClient(path=str(chroma_path))
    collection = client.get_collection(name=settings.collection_name)
    total_chunks = collection.count()
    print(f"[+] Found {total_chunks} chunks in ChromaDB collection '{settings.collection_name}'.")

    if total_chunks == 0:
        print("[-] ChromaDB collection is empty.")
        return 0

    print("[+] Connecting to Neon PostgreSQL...")
    conn = get_neon_connection()
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        print("[+] Ensuring Neon vector extension and table schema exist...")
        ensure_neon_schema(cursor)
        conn.commit()

        # Check existing row count
        cursor.execute("SELECT count(*) FROM knowledge_chunks;")
        initial_count = cursor.fetchone()[0]
        print(f"[+] Current rows in Neon knowledge_chunks: {initial_count}")

        print(f"[+] Beginning migration of {total_chunks} chunks in batches of {batch_size}...")
        start_time = time.time()
        inserted_total = 0

        for offset in range(0, total_chunks, batch_size):
            fetch_limit = min(batch_size, total_chunks - offset)
            batch = collection.get(
                limit=fetch_limit,
                offset=offset,
                include=["embeddings", "documents", "metadatas"]
            )

            ids = batch["ids"]
            docs = batch["documents"]
            metas = batch["metadatas"]
            embeddings = batch.get("embeddings")

            rows_to_insert = []
            for i in range(len(ids)):
                cid = ids[i]
                doc = docs[i]
                meta = metas[i] if metas and i < len(metas) else {}
                vec = embeddings[i] if embeddings is not None and i < len(embeddings) else None

                vec_str = format_vector(vec) if vec is not None else None

                rows_to_insert.append((
                    sanitize_str(cid)[:128],
                    sanitize_str(meta.get("book_title", "Unknown Book"))[:512],
                    sanitize_str(meta.get("author", "Unknown Author"))[:512],
                    sanitize_str(meta.get("chapter", "Unknown Chapter"))[:512],
                    sanitize_str(meta.get("source_file", ""))[:512],
                    sanitize_str(doc),
                    vec_str
                ))

            # Upsert into Neon
            upsert_sql = """
                INSERT INTO knowledge_chunks (chunk_id, book_title, author, chapter, source_file, text, embedding)
                VALUES %s
                ON CONFLICT (chunk_id) DO UPDATE SET
                    book_title = EXCLUDED.book_title,
                    author = EXCLUDED.author,
                    chapter = EXCLUDED.chapter,
                    source_file = EXCLUDED.source_file,
                    text = EXCLUDED.text,
                    embedding = EXCLUDED.embedding;
            """
            execute_values(cursor, upsert_sql, rows_to_insert, page_size=batch_size)
            conn.commit()

            inserted_total += len(rows_to_insert)
            elapsed = time.time() - start_time
            pct = (inserted_total / total_chunks) * 100
            print(f"    --> Migrated {inserted_total}/{total_chunks} chunks ({pct:.1f}%) in {elapsed:.1f}s")

        cursor.execute("SELECT count(*) FROM knowledge_chunks;")
        final_count = cursor.fetchone()[0]
        print(f"\n[OK] Successfully pushed ChromaDB to Neon PostgreSQL!")
        print(f"[OK] Total rows now in Neon knowledge_chunks: {final_count}")
        return final_count

    except Exception as e:
        conn.rollback()
        print(f"[!] Migration failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    migrate_chroma_to_neon()
