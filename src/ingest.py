"""Ingestion Pipeline: Parses PDFs, chunks text, and stores in ChromaDB & BM25."""

import argparse
import hashlib
import json
import pickle
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple

# Ensure Windows terminal handles UTF-8 (e.g. card suit symbols ♠, ♥, ♦, ♣)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import chromadb
from chromadb.utils import embedding_functions
from rank_bm25 import BM25Okapi
from tqdm import tqdm

from src.config import settings
from src.parser import parse_pdf
from src.chunker import chunk_pages, Chunk


def calculate_md5(file_path: Path) -> str:
    """Calculates MD5 checksum of a file for change detection."""
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def load_manifest() -> Dict[str, Any]:
    """Loads the ingestion manifest tracking processed files."""
    if settings.MANIFEST_PATH.exists():
        try:
            with open(settings.MANIFEST_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_manifest(manifest: Dict[str, Any]) -> None:
    """Saves the ingestion manifest to disk."""
    settings.MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(settings.MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def get_embedding_function():
    """Initializes the embedding function based on settings."""
    if settings.embedding_provider == "local":
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.local_embedding_model
        )
    elif settings.embedding_provider == "gemini" and settings.gemini_api_key:
        return embedding_functions.GoogleGenerativeAiEmbeddingFunction(
            api_key=settings.gemini_api_key,
            model_name="models/text-embedding-004"
        )
    else:
        # Fallback to default Chroma embedding function
        return embedding_functions.DefaultEmbeddingFunction()


def tokenize_for_bm25(text: str) -> List[str]:
    """Fast regex-based tokenizer for BM25 keyword matching."""
    return re.findall(r"\b\w+\b", text.lower())


def ingest_books(
    force: bool = False,
    sample_only: bool = False,
    specific_book: str = None
) -> None:
    """Runs the end-to-end ingestion pipeline."""
    print("=" * 60)
    print("  POKER COACH - CHROMADB & BM25 INGESTION PIPELINE")
    print("=" * 60)

    # 1. Discover PDF books
    pdf_files = sorted(list(settings.BOOKS_DIR.glob("*.pdf")), key=lambda p: p.stat().st_size)
    if not pdf_files:
        print(f"[-] No PDF books found in {settings.BOOKS_DIR}")
        sys.exit(1)

    if specific_book:
        pdf_files = [p for p in pdf_files if specific_book.lower() in p.name.lower()]
        if not pdf_files:
            print(f"[-] Specific book matching '{specific_book}' not found.")
            sys.exit(1)
    elif sample_only:
        # Pick the smallest book for rapid sample testing
        pdf_files = [pdf_files[0]]
        print(f"[!] Running in SAMPLE mode on smallest book: {pdf_files[0].name}")

    print(f"[+] Found {len(pdf_files)} book(s) to process.")

    # 2. Setup ChromaDB client & collection
    print(f"[+] Initializing ChromaDB at: {settings.chroma_dir}")
    client = chromadb.PersistentClient(path=str(settings.chroma_dir))
    embed_fn = get_embedding_function()
    collection = client.get_or_create_collection(
        name=settings.collection_name,
        embedding_function=embed_fn,
        metadata={"hnsw:space": "cosine"}
    )

    manifest = load_manifest()

    # Track all chunks for BM25 indexing (existing + new)
    all_chunks: List[Chunk] = []

    # If BM25 exists and not forcing full re-index, load existing BM25 corpus data
    existing_bm25_data = None
    if settings.BM25_PATH.exists() and not force:
        try:
            with open(settings.BM25_PATH, "rb") as f:
                existing_bm25_data = pickle.load(f)
                print(f"[+] Loaded existing BM25 corpus ({len(existing_bm25_data.get('chunk_ids', []))} chunks)")
        except Exception as e:
            print(f"[!] Could not load existing BM25 index: {e}")

    # 3. Process books
    for pdf_path in pdf_files:
        file_hash = calculate_md5(pdf_path)
        book_key = pdf_path.name

        if not force and book_key in manifest and manifest[book_key].get("status") == "completed":
            if manifest[book_key].get("md5") == file_hash:
                print(f"[~] Skipping already ingested book: {pdf_path.name}")
                continue

        print(f"\n---> Processing: {pdf_path.name} ({pdf_path.stat().st_size / (1024*1024):.2f} MB)")
        start_time = time.time()

        try:
            # Parse pages
            pages = parse_pdf(pdf_path)
            print(f"    Extracted {len(pages)} pages with text.")

            if not pages:
                print(f"    [!] No extractable text found in {pdf_path.name}")
                continue

            # Chunk pages (one paragraph = one chunk, no overlap)
            chunks = chunk_pages(pages)
            print(f"    Generated {len(chunks)} chunks.")

            # Batch upsert into ChromaDB
            batch_size = settings.batch_size
            total_batches = (len(chunks) + batch_size - 1) // batch_size

            print("    Upserting chunks into ChromaDB...")
            for b_idx in tqdm(range(total_batches), desc="    Progress", unit="batch"):
                batch = chunks[b_idx * batch_size : (b_idx + 1) * batch_size]
                b_ids = [c.id for c in batch]
                b_docs = [c.text for c in batch]
                b_metas = [c.metadata for c in batch]

                collection.upsert(
                    ids=b_ids,
                    documents=b_docs,
                    metadatas=b_metas
                )

            all_chunks.extend(chunks)

            # Update manifest
            manifest[book_key] = {
                "md5": file_hash,
                "status": "completed",
                "pages_extracted": len(pages),
                "chunks_created": len(chunks),
                "ingested_at": datetime.utcnow().isoformat(),
                "duration_seconds": round(time.time() - start_time, 2)
            }
            save_manifest(manifest)
            print(f"    [OK] Ingested {len(chunks)} chunks in {round(time.time() - start_time, 2)}s")

        except Exception as e:
            print(f"    [ERROR] Failed to ingest {pdf_path.name}: {e}")
            manifest[book_key] = {
                "md5": file_hash,
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            save_manifest(manifest)

    # 4. Build and Save BM25 Index
    print("\n" + "=" * 60)
    print("  BUILDING BM25 KEYWORD INDEX FOR HYBRID RETRIEVAL")
    print("=" * 60)

    # Query all documents from Chroma to build a synchronized BM25 index
    print("[+] Extracting full corpus from ChromaDB for BM25 synchronization...")
    all_chroma_data = collection.get(include=["documents", "metadatas"])
    total_docs = len(all_chroma_data["ids"])
    print(f"[+] Total chunks in ChromaDB: {total_docs}")

    if total_docs > 0:
        print("[+] Tokenizing corpus for BM25...")
        tokenized_corpus = [tokenize_for_bm25(doc) for doc in tqdm(all_chroma_data["documents"], desc="Tokenizing")]
        
        print("[+] Fitting BM25Okapi model...")
        bm25_model = BM25Okapi(tokenized_corpus)

        bm25_payload = {
            "bm25": bm25_model,
            "chunk_ids": all_chroma_data["ids"],
            "documents": all_chroma_data["documents"],
            "metadatas": all_chroma_data["metadatas"],
            "updated_at": datetime.utcnow().isoformat()
        }

        with open(settings.BM25_PATH, "wb") as f:
            pickle.dump(bm25_payload, f)
        print(f"[OK] Saved BM25 index to {settings.BM25_PATH}")
    else:
        print("[-] No documents found to index for BM25.")

    print("\n" + "=" * 60)
    print("  INGESTION COMPLETE!")
    print(f"  ChromaDB Collection: '{settings.collection_name}' ({collection.count()} chunks)")
    print(f"  ChromaDB Path:        {settings.chroma_dir}")
    print(f"  BM25 Index Path:      {settings.BM25_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Poker Strategy Books into ChromaDB & BM25")
    parser.add_argument("--force", action="store_true", help="Force re-ingest all books")
    parser.add_argument("--sample", action="store_true", help="Ingest only smallest book for quick testing")
    parser.add_argument("--book", type=str, default=None, help="Ingest a specific book by name")

    args = parser.parse_args()
    ingest_books(force=args.force, sample_only=args.sample, specific_book=args.book)
