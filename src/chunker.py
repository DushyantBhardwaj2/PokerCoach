"""Paragraph-based chunking with metadata propagation.

Per conv.md the knowledge base is chunked one paragraph at a time with no
overlap: each paragraph becomes an independent chunk, short paragraphs are kept
as-is (never merged), and only tiny whitespace/junk fragments are discarded.
Paragraphs longer than ``settings.max_chunk_chars`` are split on sentence
boundaries (still no overlap) so they stay within the embedding context window.
"""

import hashlib
import re
from typing import List, Dict, Any
from pydantic import BaseModel
from src.parser import PageContent
from src.config import settings


class Chunk(BaseModel):
    """Represents a text chunk with unique ID and rich metadata."""
    id: str
    text: str
    metadata: Dict[str, Any]


def slugify(text: str) -> str:
    """Creates a URL/ID-safe slug from text."""
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "_", slug)[:30]


def split_paragraphs(text: str) -> List[str]:
    """Splits cleaned page text into paragraphs on blank-line boundaries."""
    parts = re.split(r"\n\s*\n", text)
    paragraphs: List[str] = []
    for part in parts:
        # Collapse single newlines inside a paragraph into spaces.
        para = re.sub(r"\s*\n\s*", " ", part).strip()
        para = re.sub(r"\s+", " ", para)
        if para:
            paragraphs.append(para)
    return paragraphs


def split_oversized(paragraph: str, max_chars: int) -> List[str]:
    """Splits an over-long paragraph on sentence boundaries, without overlap."""
    if len(paragraph) <= max_chars:
        return [paragraph]

    sentences = re.split(r"(?<=[.!?])\s+", paragraph)
    pieces: List[str] = []
    current = ""
    for sentence in sentences:
        candidate = f"{current} {sentence}".strip() if current else sentence
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                pieces.append(current)
            # A single sentence longer than the cap is hard-split as a last resort.
            if len(sentence) > max_chars:
                for i in range(0, len(sentence), max_chars):
                    pieces.append(sentence[i:i + max_chars].strip())
                current = ""
            else:
                current = sentence
    if current:
        pieces.append(current)
    return [p for p in pieces if p]


def chunk_pages(pages: List[PageContent]) -> List[Chunk]:
    """
    Takes a list of PageContent objects and produces a flat list of paragraph
    Chunk objects with book/chapter metadata and deterministic content-hash IDs.
    """
    all_chunks: List[Chunk] = []
    seen_ids: set = set()

    for page in pages:
        book_slug = slugify(page.book_title)
        chapter_slug = slugify(page.chapter) or "unknown"

        for paragraph in split_paragraphs(page.text):
            for piece in split_oversized(paragraph, settings.max_chunk_chars):
                if len(piece) < settings.min_chunk_length:
                    continue

                digest = hashlib.md5(f"{book_slug}|{piece}".encode("utf-8")).hexdigest()[:10]
                chunk_id = f"{book_slug}_{chapter_slug}_{digest}"
                if chunk_id in seen_ids:
                    continue  # identical paragraph already ingested (dedupe)
                seen_ids.add(chunk_id)

                all_chunks.append(
                    Chunk(
                        id=chunk_id,
                        text=piece,
                        metadata={
                            "book_title": page.book_title,
                            "author": page.author,
                            "chapter": page.chapter,
                            "source_file": page.source_file,
                        },
                    )
                )

    return all_chunks
