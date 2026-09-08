"""RAG AI Coach Engine.

Builds a structured, grounded prompt from the live hand, the opponent read, and
the top retrieved book passages, then asks Gemini for a SINGLE natural coaching
paragraph (no JSON, no gauges). When no API key is configured it falls back to a
deterministic, math-grounded paragraph. The recommended action/sizing shown in
the UI is always derived from the equity + pot-odds math so it stays consistent
with (and independent of) the prose.
"""

import json
import os
from typing import List, Dict, Any, Tuple, Optional

from src.config import settings
from backend.poker.models import (
    Card,
    GameStreet,
    OpponentProfile,
    RetrievedBookKnowledge,
    AdviceResponse,
)


def derive_action(
    win_prob: float,
    required_equity: float,
    call_amount: float,
    pot_size: float,
    player_stack: float,
) -> Tuple[str, Optional[float], str]:
    """
    Deterministic recommended action from equity + pot odds (zero ML, zero bluff
    modelling). Returns (action, bet_sizing, confidence). Used both to drive the
    UI's headline action and to steer the coaching prose so they never disagree.
    """
    if call_amount == 0:
        if win_prob > 0.65:
            sizing = round(min(player_stack, max(10.0, pot_size * 0.66)), 0)
            return "RAISE", sizing, "High"
        return "CHECK", None, "High"

    equity_edge = win_prob - required_equity
    if equity_edge > 0.15:
        if win_prob > 0.75:
            sizing = round(min(player_stack, call_amount * 3.0), 0)
            return "RAISE", sizing, "High"
        return "CALL", None, "High"
    if equity_edge >= -0.03:
        return "CALL", None, "Medium"
    return "FOLD", None, "High"


def _citation_label(chunk: RetrievedBookKnowledge) -> str:
    """Natural "Book — Chapter" citation label (chapter omitted when unknown)."""
    if chunk.chapter and chunk.chapter.lower() != "unknown":
        return f"{chunk.book_title} ({chunk.chapter})"
    return chunk.book_title


def format_prompt_sections(
    hole_cards: List[Card],
    community_cards: List[Card],
    street: GameStreet,
    pot_size: float,
    call_amount: float,
    player_stack: float,
    win_prob: float,
    pot_odds_pct: float,
    required_equity: float,
    ev: float,
    opponent: OpponentProfile,
    retrieved_chunks: List[RetrievedBookKnowledge],
) -> Dict[str, str]:
    """Builds the structured prompt sections (structured input, natural output)."""
    # 1. CURRENT HAND
    hole_str = " ".join([c.display for c in hole_cards])
    board_str = " ".join([c.display for c in community_cards]) if community_cards else "None (Pre-flop)"
    current_hand_section = f"""- Street: {street.value.upper()}
- Hero Hole Cards: {hole_str}
- Board: {board_str}
- Pot Size: ${pot_size:.2f}
- Amount to Call: ${call_amount:.2f}
- Hero Stack: ${player_stack:.2f}
- Win Probability (Equity): {win_prob * 100:.1f}%
- Pot Odds Required: {pot_odds_pct:.1f}% (Break-even equity: {required_equity * 100:.1f}%)
- Estimated Call EV: ${ev:.2f}"""

    # 2. OPPONENT SUMMARY
    opponent_section = f"""- Name: {opponent.name}
- Archetype: {opponent.archetype}
- VPIP: {opponent.vpip * 100:.1f}%
- PFR: {opponent.pfr * 100:.1f}%
- Aggression Factor (AF): {opponent.aggression_factor:.1f}"""

    # 3. RETRIEVED BOOK KNOWLEDGE (Top chunks; cite by book + chapter only)
    knowledge_items = []
    for idx, chunk in enumerate(retrieved_chunks, 1):
        knowledge_items.append(
            f'[{idx}] "{_citation_label(chunk)}" by {chunk.author}:\n"{chunk.snippet}"'
        )
    knowledge_section = "\n\n".join(knowledge_items) if knowledge_items else "No relevant book excerpts found."

    return {
        "current_hand": current_hand_section,
        "opponent_summary": opponent_section,
        "retrieved_knowledge": knowledge_section,
    }


def assemble_full_prompt(
    sections: Dict[str, str],
    recommended_action: str,
    bet_sizing: Optional[float],
) -> str:
    """Assembles the grounded prompt asking for ONE natural coaching paragraph."""
    action_hint = recommended_action
    if bet_sizing:
        action_hint = f"{recommended_action} to about ${bet_sizing:.0f}"

    return f"""You are PokerSense AI, an elite but encouraging poker coach. You explain
decisions using GTO fundamentals, opponent tendencies, and canonical poker literature.

### CURRENT HAND
{sections['current_hand']}

### OPPONENT SUMMARY
{sections['opponent_summary']}

### RETRIEVED BOOK KNOWLEDGE
{sections['retrieved_knowledge']}

### YOUR TASK
Write ONE natural coaching paragraph (about 4-6 sentences) of flowing prose that:
- Opens with a clear recommendation. The mathematically sound action here is {action_hint}; recommend it plainly and, if raising or betting, mention the sizing.
- Explains the reasoning using the hand's equity, the pot odds, the EV, and the opponent's tendencies above.
- Weaves in at most ONE reference to the single most relevant retrieved book, mentioning it by title (and chapter if provided) in natural language — only if that passage genuinely supports the point.
- Prioritizes the live hand and its math over generic theory whenever they conflict.

### GROUNDING RULES (must follow)
- Only reference a book or chapter that literally appears in RETRIEVED BOOK KNOWLEDGE above. Never invent a book title, chapter, author, quotation, page number, or statistic.
- If none of the retrieved passages are relevant, give your advice from the math and opponent read alone and do NOT cite any book.
- Output plain prose only: no JSON, no markdown, no headings, no bullet points, no lists — just one paragraph.
"""


def build_fallback_paragraph(
    action: str,
    bet_sizing: Optional[float],
    win_prob: float,
    required_equity: float,
    ev: float,
    call_amount: float,
    pot_size: float,
    opponent: OpponentProfile,
    retrieved_chunks: List[RetrievedBookKnowledge],
) -> str:
    """
    Deterministic, math-grounded coaching paragraph used when Gemini is offline
    or unconfigured. Cites the top retrieved book + chapter naturally (only when
    a passage was actually retrieved — never invents one).
    """
    citation = ""
    if retrieved_chunks:
        citation = f" This lines up with the guidance in {_citation_label(retrieved_chunks[0])}."

    eq = f"{win_prob * 100:.1f}%"
    req = f"{required_equity * 100:.1f}%"

    if action == "RAISE" and call_amount == 0:
        size = f" around ${bet_sizing:.0f} (about two-thirds of the pot)" if bet_sizing else ""
        return (
            f"I'd bet here{size}. With {eq} equity you hold a clear edge, so the goal is to build the "
            f"pot and get value from {opponent.name}'s weaker holdings rather than checking and letting "
            f"them realize their equity for free.{citation}"
        ).strip()

    if action == "RAISE":
        size = f" to about ${bet_sizing:.0f}" if bet_sizing else ""
        return (
            f"I'd raise{size}. Your {eq} equity comfortably clears the {req} you need to continue, and "
            f"raising turns that edge into value while denying {opponent.name} a cheap look at the next card "
            f"(estimated EV +${ev:.2f}).{citation}"
        ).strip()

    if action == "CHECK":
        return (
            f"I'd check and keep the pot under control. You have {eq} equity but no bet to call, so taking a "
            f"free card and realizing your hand's showdown value is the disciplined play against {opponent.name} "
            f"rather than bloating the pot out of position.{citation}"
        ).strip()

    if action == "CALL":
        return (
            f"I'd call. Your {eq} equity meets or beats the {req} the pot odds require, which makes continuing "
            f"a positive-expectation decision (EV ${ev:+.2f}); flatting also keeps {opponent.name}'s weaker "
            f"bluffs and dominated hands in the pot.{citation}"
        ).strip()

    # FOLD
    return (
        f"I'd fold. Your {eq} equity falls short of the {req} you need to call profitably, so chasing here is a "
        f"small but steady leak (EV ${ev:+.2f}). Save the chips for a spot where the math is on your side.{citation}"
    ).strip()


def call_gemini(prompt: str) -> Optional[str]:
    """Calls Gemini and returns the raw coaching paragraph text, or None."""
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    model = settings.gemini_model or "gemini-3.6-flash"

    try:
        import urllib.request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
            },
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return " ".join(text.split()).strip() if text else None
    except Exception as e:
        print(f"[!] Gemini API call failed or timed out: {e}")
        return None


def get_coach_advice(
    hole_cards: List[Card],
    community_cards: List[Card],
    street: GameStreet,
    pot_size: float,
    call_amount: float,
    player_stack: float,
    win_prob: float,
    pot_odds_ratio: float,
    pot_odds_pct: float,
    required_equity: float,
    ev: float,
    opponent: OpponentProfile,
    retrieved_chunks: List[RetrievedBookKnowledge],
) -> AdviceResponse:
    """Orchestrates action derivation, prompt synthesis, and paragraph generation."""
    action, bet_sizing, confidence = derive_action(
        win_prob=win_prob,
        required_equity=required_equity,
        call_amount=call_amount,
        pot_size=pot_size,
        player_stack=player_stack,
    )

    sections = format_prompt_sections(
        hole_cards=hole_cards,
        community_cards=community_cards,
        street=street,
        pot_size=pot_size,
        call_amount=call_amount,
        player_stack=player_stack,
        win_prob=win_prob,
        pot_odds_pct=pot_odds_pct,
        required_equity=required_equity,
        ev=ev,
        opponent=opponent,
        retrieved_chunks=retrieved_chunks,
    )
    full_prompt = assemble_full_prompt(sections, action, bet_sizing)

    coach_paragraph = call_gemini(full_prompt)
    if not coach_paragraph:
        coach_paragraph = build_fallback_paragraph(
            action=action,
            bet_sizing=bet_sizing,
            win_prob=win_prob,
            required_equity=required_equity,
            ev=ev,
            call_amount=call_amount,
            pot_size=pot_size,
            opponent=opponent,
            retrieved_chunks=retrieved_chunks,
        )

    return AdviceResponse(
        action=action,
        bet_sizing=bet_sizing,
        confidence=confidence,
        coach_paragraph=coach_paragraph,
        win_probability=win_prob,
        pot_odds_ratio=pot_odds_ratio,
        pot_odds_percentage=pot_odds_pct,
        required_equity=required_equity,
        expected_value=ev,
        retrieved_knowledge=retrieved_chunks,
    )
