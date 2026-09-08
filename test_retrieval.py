"""CLI tool to test and verify ChromaDB & BM25 Hybrid Retrieval."""

import argparse
import sys
from src.retriever import HybridRetriever

# Ensure Windows terminal supports Unicode poker card suits (♠, ♥, ♦, ♣)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def display_results(query: str, results):
    print("\n" + "=" * 80)
    print(f"QUERY: \"{query}\"")
    print("=" * 80)

    if not results:
        print("No matching knowledge found.")
        return

    for rank, res in enumerate(results, 1):
        print(f"\n[{rank}] {res.book_title} (by {res.author}) - Chapter: {res.chapter}")
        print(f"    Chunk ID:      {res.chunk_id}")
        print(f"    Hybrid Score:  {res.hybrid_score:.4f} (Vector: {res.vector_score:.4f}, BM25: {res.bm25_score:.4f})")
        print("    " + "-" * 76)

        # Print preview of text
        snippet_lines = res.text.strip().split("\n")
        preview = "\n    ".join(snippet_lines[:5])
        if len(snippet_lines) > 5:
            preview += "\n    ..."
        print(f"    {preview}")

    print("\n" + "=" * 80)


def main():
    parser = argparse.ArgumentParser(description="Test Hybrid Poker Retrieval")
    parser.add_argument("--query", "-q", type=str, help="Poker strategy question or situation")
    parser.add_argument("--top_k", "-k", type=int, default=5, help="Number of chunks to retrieve (default: 5)")
    args = parser.parse_args()

    print("[+] Initializing Hybrid Retriever (ChromaDB + BM25)...")
    retriever = HybridRetriever()

    if args.query:
        results = retriever.search(args.query, top_k=args.top_k)
        display_results(args.query, results)
    else:
        print("\n[!] Interactive Mode. Enter poker strategy questions (or 'exit' to quit):")
        while True:
            try:
                query = input("\nEnter query > ").strip()
                if not query or query.lower() in ["exit", "quit", "q"]:
                    break
                results = retriever.search(query, top_k=args.top_k)
                display_results(query, results)
            except (KeyboardInterrupt, EOFError):
                break


if __name__ == "__main__":
    main()
