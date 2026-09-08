"""Hybrid Retriever: Combines ChromaDB vector search and BM25 keyword search (70/30).

Single source of truth for retrieval, shared by the CLI (test_retrieval.py)
and the FastAPI backend (backend/main.py), per conv.md:

  - Retrieve top 5 from vector search (ChromaDB)
  - Retrieve top 5 from BM25 keyword search
  - Min-max normalize both score sets within their own result lists
  - Fuse with 70% vector + 30% BM25 weighted score
  - Return the best 5 deduplicated chunks
"""

import pickle
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

import chromadb
from chromadb.utils import embedding_functions

from src.config import settings
from src.ingest import get_embedding_function, tokenize_for_bm25


class SearchResult(BaseModel):
    """Represents a retrieved chunk with hybrid scoring attribution."""
    chunk_id: str
    text: str
    book_title: str
    author: str
    chapter: str
    source_file: str
    vector_score: float
    bm25_score: float
    hybrid_score: float


def _minmax_normalize(raw_scores: List[float]) -> List[float]:
    """Min-max normalizes scores into [0.1, 1.0].

    Both vector and BM25 score distributions are normalized within their own
    candidate sets so that neither leg's raw scale can dominate the 70/30
    weighted fusion (raw cosine similarities cluster near 0.85, while raw
    BM25 scores range 0-30+).
    """
    if not raw_scores:
        return []
    max_s = max(raw_scores)
    min_s = min(raw_scores)
    if max_s <= min_s:
        return [1.0 for _ in raw_scores]
    spread = max_s - min_s
    return [0.1 + 0.9 * ((s - min_s) / spread) for s in raw_scores]


class HybridRetriever:
    """
    Executes hybrid retrieval combining Vector similarity (ChromaDB)
    and BM25 lexical search with the 70/30 weighting from conv.md.
    """

    def __init__(self, chroma_dir: Optional[Path] = None, bm25_path: Optional[Path] = None):
        self.chroma_dir = chroma_dir or settings.chroma_dir
        self.bm25_path = bm25_path or settings.bm25_path

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=str(self.chroma_dir))
        self.embed_fn = get_embedding_function()
        self.collection = self.client.get_or_create_collection(
            name=settings.collection_name,
            embedding_function=self.embed_fn,
            metadata={"hnsw:space": "cosine"}
        )

        # Initialize BM25 Index
        self.bm25_data = None
        self._load_bm25()

    def _load_bm25(self) -> None:
        """Loads BM25 serialized index and document store."""
        if self.bm25_path.exists():
            try:
                with open(self.bm25_path, "rb") as f:
                    self.bm25_data = pickle.load(f)
            except Exception as e:
                print(f"[!] Warning: Failed to load BM25 index: {e}")
                self.bm25_data = None
        else:
            self.bm25_data = None

    def vector_search(self, query: str, top_k: int = settings.vector_top_k) -> List[Dict[str, Any]]:
        """Performs vector similarity search on ChromaDB with normalized scores."""
        if self.collection.count() == 0:
            return []

        results = self.collection.query(
            query_texts=[query],
            n_results=min(top_k, self.collection.count()),
            include=["documents", "metadatas", "distances"]
        )

        vector_hits: List[Dict[str, Any]] = []
        if not results or not results["ids"] or not results["ids"][0]:
            return vector_hits

        ids = results["ids"][0]
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]

        # Cosine distance to similarity: similarity = 1.0 - (dist / 2.0)
        raw_sims = [max(0.0, min(1.0, 1.0 - (dist / 2.0))) for dist in distances]
        norm_sims = _minmax_normalize(raw_sims)

        for cid, doc, meta, norm, raw in zip(ids, docs, metas, norm_sims, raw_sims):
            vector_hits.append({
                "id": cid,
                "document": doc,
                "metadata": meta,
                "score": float(norm),
                "raw_score": float(raw)
            })

        return vector_hits

    def bm25_search(self, query: str, top_k: int = settings.bm25_top_k) -> List[Dict[str, Any]]:
        """Performs BM25 keyword search with normalized scores."""
        if not self.bm25_data:
            self._load_bm25()
            if not self.bm25_data:
                return []

        bm25_model = self.bm25_data["bm25"]
        chunk_ids = self.bm25_data["chunk_ids"]
        documents = self.bm25_data["documents"]
        metadatas = self.bm25_data["metadatas"]

        tokenized_query = tokenize_for_bm25(query)
        if not tokenized_query:
            return []

        scores = bm25_model.get_scores(tokenized_query)

        # Get top K indices with positive score
        top_indices = sorted(
            [i for i in range(len(scores)) if scores[i] > 0.0],
            key=lambda i: scores[i],
            reverse=True
        )[:top_k]

        if not top_indices:
            return []

        raw_scores = [scores[i] for i in top_indices]
        norm_scores = _minmax_normalize(raw_scores)

        bm25_hits: List[Dict[str, Any]] = []
        for idx, norm, raw in zip(top_indices, norm_scores, raw_scores):
            bm25_hits.append({
                "id": chunk_ids[idx],
                "document": documents[idx],
                "metadata": metadatas[idx],
                "score": float(norm),
                "raw_score": float(raw)
            })

        return bm25_hits

    def search(
        self,
        query: str,
        top_k: int = settings.final_top_k,
        vector_weight: float = settings.vector_weight,
        bm25_weight: float = settings.bm25_weight,
    ) -> List[SearchResult]:
        """
        Executes hybrid retrieval per conv.md:
        - Retrieves 5 vector candidates and 5 BM25 candidates
        - Fuses scores: 0.70 * Vector + 0.30 * BM25 (both min-max normalized)
        - Returns top K deduplicated SearchResults
        """
        vector_hits = self.vector_search(query, top_k=settings.vector_top_k)
        bm25_hits = self.bm25_search(query, top_k=settings.bm25_top_k)

        candidates: Dict[str, Dict[str, Any]] = {}

        for hit in vector_hits:
            cid = hit["id"]
            candidates[cid] = {
                "id": cid,
                "document": hit["document"],
                "metadata": hit["metadata"],
                "vector_score": hit["score"],
                "bm25_score": 0.0
            }

        for hit in bm25_hits:
            cid = hit["id"]
            if cid in candidates:
                candidates[cid]["bm25_score"] = hit["score"]
            else:
                candidates[cid] = {
                    "id": cid,
                    "document": hit["document"],
                    "metadata": hit["metadata"],
                    "vector_score": 0.0,
                    "bm25_score": hit["score"]
                }

        results: List[SearchResult] = []
        for cid, item in candidates.items():
            v_score = item["vector_score"]
            b_score = item["bm25_score"]
            hybrid_score = (vector_weight * v_score) + (bm25_weight * b_score)

            meta = item["metadata"]
            results.append(
                SearchResult(
                    chunk_id=cid,
                    text=item["document"],
                    book_title=meta.get("book_title", "Unknown Book"),
                    author=meta.get("author", "Unknown Author"),
                    chapter=meta.get("chapter", "Unknown"),
                    source_file=meta.get("source_file", ""),
                    vector_score=round(v_score, 4),
                    bm25_score=round(b_score, 4),
                    hybrid_score=round(hybrid_score, 4),
                )
            )

        results.sort(key=lambda r: r.hybrid_score, reverse=True)
        return results[:top_k]
