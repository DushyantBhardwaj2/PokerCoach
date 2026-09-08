"""Domain and request/response models for Poker Coach."""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Suit(str, Enum):
    SPADES = "s"
    HEARTS = "h"
    DIAMONDS = "d"
    CLUBS = "c"


class Rank(str, Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "T"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"


class HandRank(int, Enum):
    HIGH_CARD = 1
    PAIR = 2
    TWO_PAIR = 3
    THREE_OF_A_KIND = 4
    STRAIGHT = 5
    FLUSH = 6
    FULL_HOUSE = 7
    FOUR_OF_A_KIND = 8
    STRAIGHT_FLUSH = 9
    ROYAL_FLUSH = 10


class Card(BaseModel):
    rank: Rank
    suit: Suit

    def __str__(self) -> str:
        return f"{self.rank.value}{self.suit.value}"

    @property
    def display(self) -> str:
        suit_symbols = {"s": "♠", "h": "♥", "d": "♦", "c": "♣"}
        rank_display = "10" if self.rank.value == "T" else self.rank.value
        return f"{rank_display}{suit_symbols.get(self.suit.value, self.suit.value)}"

    @classmethod
    def from_str(cls, card_str: str) -> "Card":
        """Parses strings like 'As', 'Ah', '10d', 'Td', '2c'."""
        s = card_str.strip().replace("10", "T")
        if len(s) < 2:
            raise ValueError(f"Invalid card string: '{card_str}'")

        r_char = s[0].upper()
        s_char = s[1].lower()

        rank_map = {r.value: r for r in Rank}
        suit_map = {s.value: s for s in Suit}

        if r_char not in rank_map:
            raise ValueError(f"Invalid rank in card '{card_str}'")
        if s_char not in suit_map:
            raise ValueError(f"Invalid suit in card '{card_str}'")

        return cls(rank=rank_map[r_char], suit=suit_map[s_char])


class GameStreet(str, Enum):
    PRE_FLOP = "pre-flop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"


class OpponentProfile(BaseModel):
    name: str = "Villain"
    vpip: float = Field(default=0.25, ge=0.0, le=1.0, description="Voluntarily Put in Pot %")
    pfr: float = Field(default=0.18, ge=0.0, le=1.0, description="Pre-Flop Raise %")
    aggression_factor: float = Field(default=2.0, ge=0.0, description="AF (Bets+Raises)/Calls")
    archetype: str = "TAG (Tight Aggressive)"
    recent_action: str = "bet"
    recent_bet_size: float = 0.0


class AdviceRequest(BaseModel):
    hole_cards: List[str] = Field(..., description="e.g. ['As', 'Kd']")
    community_cards: List[str] = Field(default_factory=list, description="e.g. ['Qh', 'Jc', '2s']")
    pot_size: float = Field(default=100.0, ge=0.0)
    call_amount: float = Field(default=20.0, ge=0.0)
    player_stack: float = Field(default=500.0, ge=0.0)
    street: Optional[GameStreet] = None
    num_opponents: int = Field(default=1, ge=1, le=9)
    opponent: Optional[OpponentProfile] = None


class RetrievedBookKnowledge(BaseModel):
    chunk_id: str
    book_title: str
    author: str
    chapter: str
    hybrid_score: float
    vector_score: float
    bm25_score: float
    snippet: str


class AdviceResponse(BaseModel):
    action: str  # FOLD, CHECK, CALL, RAISE
    bet_sizing: Optional[float] = None
    confidence: str  # High, Medium, Low
    coach_paragraph: str  # single natural coaching paragraph (recommendation + reasoning + citation)
    win_probability: float
    pot_odds_ratio: float
    pot_odds_percentage: float
    required_equity: float
    expected_value: float
    retrieved_knowledge: List[RetrievedBookKnowledge] = []
