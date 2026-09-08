"""PDF Document Parser using PyMuPDF (fitz) with metadata extraction."""

import re
import unicodedata
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel


class PageContent(BaseModel):
    """Represents the extracted text and metadata of a single PDF page.

    Page numbers are intentionally NOT tracked: per conv.md the required
    citation granularity is book + chapter only.
    """
    text: str
    book_title: str
    author: str
    source_file: str
    chapter: str = "Unknown"


def extract_metadata_from_filename(filename: str) -> tuple[str, str]:
    """
    Extracts clean book title and author name from typical book filenames.
    Example: 'Applications of No-Limit Hold em (Matthew Janda) (z-library.sk...).pdf'
    Returns: ('Applications of No-Limit Hold em', 'Matthew Janda')
    """
    stem = Path(filename).stem

    # Remove z-library and similar tags
    stem = re.sub(r"\(z-library[^)]*\)", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"\(1lib[^)]*\)", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"\(z-lib[^)]*\)", "", stem, flags=re.IGNORECASE)

    # Check for author inside parentheses: Title (Author)
    parentheses_matches = re.findall(r"\(([^)]+)\)", stem)
    author = "Unknown"
    title = stem

    if parentheses_matches:
        # Check first match for likely author
        possible_author = parentheses_matches[0].strip()
        # Clean up any inner brackets e.g. [Chesterton, James]
        possible_author = re.sub(r"\[[^\]]*\]", "", possible_author).strip()
        if len(possible_author) > 2 and not any(kw in possible_author.lower() for kw in ["edition", "vol", "part"]):
            author = possible_author

        # Remove parentheses from title
        title = re.sub(r"\([^)]*\)", "", stem)

    # Clean underscores and excess spaces
    title = title.replace("_", " ").strip()
    title = re.sub(r"\s+", " ", title)

    # Specific friendly overrides for known files
    title_lower = title.lower()
    if "applications of no-limit hold em" in title_lower:
        return "Applications of No-Limit Hold'em", "Matthew Janda"
    elif "harrington on hold em" in title_lower:
        return "Harrington on Hold'em", "Dan Harrington"
    elif "modern poker theory" in title_lower:
        return "Modern Poker Theory", "Michael Acevedo"
    elif "poker poker math" in title_lower or "poker math" in title_lower:
        return "Poker Math", "James Chesterton"
    elif "stop 10 things" in title_lower:
        return "STOP: 10 Things Good Poker Players Don't Do", "Ed Miller & James Sweeney"
    elif "mathematics of poker" in title_lower:
        return "The Mathematics of Poker", "Bill Chen & Jerrod Ankenman"
    elif "theory of poker" in title_lower:
        return "The Theory of Poker", "David Sklansky"

    return title, author


def clean_text(text: str) -> str:
    """Normalizes whitespace and removes unprintable / invalid characters."""
    if not text:
        return ""
    # Normalize unicode
    text = unicodedata.normalize("NFKD", text)
    # Replace non-breaking spaces and tabs
    text = text.replace("\xa0", " ").replace("\t", " ")
    # Replace carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Condense multiple blank lines into two newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Strip whitespace on lines and drop bare page-number artifacts
    cleaned_lines = []
    for line in text.split("\n"):
        stripped = line.strip()
        if _is_page_artifact(stripped):
            continue
        cleaned_lines.append(stripped)
    text = "\n".join(cleaned_lines)
    # Re-condense any blank runs introduced by dropping artifact lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# --- Page-artifact & chapter-heading detection --------------------------------

_ROMAN_RE = re.compile(r"^[ivxlcdm]+$", re.IGNORECASE)
_PAGE_LABEL_RE = re.compile(r"^(page\s+)?\d{1,4}$", re.IGNORECASE)

# "Chapter 3", "Part Two", "Section 4" ...
_CHAPTER_RE = re.compile(
    r"^(chapter|part|section)\s+"
    r"([0-9]{1,3}|[ivxlcdm]{1,6}|one|two|three|four|five|six|seven|eight|nine|ten|"
    r"eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b",
    re.IGNORECASE,
)
# "3. Pot Odds and Equity" numbered section headings
_NUMBERED_RE = re.compile(r"^(\d{1,2})[\.\):]\s+([A-Z][A-Za-z].{2,58})$")


def _is_page_artifact(line: str) -> bool:
    """True for lines that are just a page number or roman-numeral folio."""
    if not line:
        return False
    if _PAGE_LABEL_RE.match(line):
        return True
    if len(line) <= 6 and _ROMAN_RE.match(line):
        return True
    return False


def _looks_like_title(line: str) -> bool:
    """Heuristic: a short, mostly-capitalized line that reads like a heading."""
    if not (3 <= len(line) <= 60):
        return False
    words = line.split()
    if not (1 <= len(words) <= 9):
        return False
    if line.endswith((".", ",", ";", ":")):
        return False
    if any(ch.isdigit() for ch in line) and not line.isupper():
        return False
    if line.isupper():
        return True
    capitalized = sum(1 for w in words if w[:1].isupper())
    return capitalized >= max(1, len(words) - 1)


def _normalize_heading(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip(" .:-")
    return text[:80]


def detect_chapter_heading(text: str) -> Optional[str]:
    """
    Scans the top of a page's cleaned text for a chapter/section heading.
    Returns a normalized heading string, or None if none is found.

    Detection is deliberately conservative (explicit "Chapter/Part/Section N",
    numbered "N. Title", or an all-caps title line at the very top of the page)
    so emphasized body text does not masquerade as a heading. Books without such
    headings simply fall back to the carried-forward / "Unknown" chapter.
    """
    lines = [ln.strip() for ln in text.split("\n")]
    non_empty = [(i, ln) for i, ln in enumerate(lines) if ln]

    for pos, (i, line) in enumerate(non_empty[:12]):
        m = _CHAPTER_RE.match(line)
        if m:
            heading = _normalize_heading(line)
            rest = line[m.end():].strip(" .:-")
            if not rest:
                # Bare "Chapter N" — pull the following title line if present.
                for _, nxt in non_empty[pos + 1: pos + 4]:
                    if _looks_like_title(nxt):
                        title = nxt.title() if nxt.isupper() else nxt
                        heading = f"{heading}: {_normalize_heading(title)}"
                        break
            heading = heading[:1].upper() + heading[1:]
            return heading[:80]

        m2 = _NUMBERED_RE.match(line)
        if m2:
            return _normalize_heading(f"{m2.group(1)}. {m2.group(2)}")

        # An all-caps title as the very first line of a page is a likely heading.
        if pos == 0 and line.isupper() and _looks_like_title(line):
            return _normalize_heading(line.title())

    return None


def _strip_running_headers(pages: List[PageContent]) -> None:
    """
    Removes repeated running headers/footers (e.g. book title or author printed
    on every page) in place. A short line appearing on more than a third of the
    pages is treated as chrome, not content.
    """
    if len(pages) < 5:
        return
    from collections import Counter

    line_counts: Counter = Counter()
    for page in pages:
        seen = set()
        for line in page.text.split("\n"):
            s = line.strip()
            if s and len(s) <= 60 and s not in seen:
                line_counts[s] += 1
                seen.add(s)

    threshold = max(3, int(len(pages) * 0.33))
    repeated = {line for line, count in line_counts.items() if count >= threshold}
    if not repeated:
        return

    for page in pages:
        kept = [ln for ln in page.text.split("\n") if ln.strip() not in repeated]
        page.text = re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip()


def parse_pdf(pdf_path: Path) -> List[PageContent]:
    """
    Parses a PDF file using PyMuPDF and returns a list of PageContent objects.
    Extracts text per page, skipping empty or blank pages.
    """
    import pymupdf as fitz

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    book_title, author = extract_metadata_from_filename(pdf_path.name)
    pages: List[PageContent] = []

    doc = fitz.open(str(pdf_path))
    current_chapter = "Unknown"
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        raw_text = page.get_text("text") or ""
        cleaned = clean_text(raw_text)

        # Skip pages with practically no text (covers/blank divider pages)
        if len(cleaned) < 40:
            continue

        # Carry the chapter forward; update it when this page starts a new one.
        heading = detect_chapter_heading(cleaned)
        if heading:
            current_chapter = heading

        pages.append(
            PageContent(
                text=cleaned,
                book_title=book_title,
                author=author,
                source_file=pdf_path.name,
                chapter=current_chapter,
            )
        )

    doc.close()

    # Drop repeated running headers/footers now that all pages are available.
    _strip_running_headers(pages)
    return pages
