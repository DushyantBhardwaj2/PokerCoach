"""Monte Carlo equity simulation and pot odds mathematics."""

import random
from collections import Counter
from itertools import combinations
from typing import List, Dict, Any, Tuple

from backend.poker.models import Card, Rank, Suit, HandRank

RANK_VALUE = {
    Rank.TWO: 2, Rank.THREE: 3, Rank.FOUR: 4, Rank.FIVE: 5,
    Rank.SIX: 6, Rank.SEVEN: 7, Rank.EIGHT: 8, Rank.NINE: 9,
    Rank.TEN: 10, Rank.JACK: 11, Rank.QUEEN: 12, Rank.KING: 13,
    Rank.ACE: 14
}


class HandValue:
    def __init__(self, rank: HandRank, values: List[int]):
        self.rank = rank
        self.values = values

    def __gt__(self, other: "HandValue") -> bool:
        if self.rank != other.rank:
            return self.rank.value > other.rank.value
        return self.values > other.values

    def __lt__(self, other: "HandValue") -> bool:
        if self.rank != other.rank:
            return self.rank.value < other.rank.value
        return self.values < other.values

    def __eq__(self, other: "HandValue") -> bool:
        return self.rank == other.rank and self.values == other.values


class HandEvaluator:
    @staticmethod
    def evaluate_7_cards(cards: List[Card]) -> HandValue:
        best_hand: HandValue = None
        for combo in combinations(cards, 5):
            current_value = HandEvaluator.evaluate_5_cards(list(combo))
            if best_hand is None or current_value > best_hand:
                best_hand = current_value
        return best_hand

    @staticmethod
    def evaluate_5_cards(cards: List[Card]) -> HandValue:
        ranks = sorted([RANK_VALUE[c.rank] for c in cards], reverse=True)
        suits = [c.suit for c in cards]
        rank_counts = Counter(ranks)
        counts = sorted(rank_counts.values(), reverse=True)

        is_flush = len(set(suits)) == 1

        is_straight = False
        straight_high_card = -1
        unique_ranks = sorted(list(set(ranks)), reverse=True)

        if len(unique_ranks) == 5:
            if unique_ranks[0] - unique_ranks[4] == 4:
                is_straight = True
                straight_high_card = unique_ranks[0]
            elif unique_ranks == [14, 5, 4, 3, 2]:
                is_straight = True
                straight_high_card = 5

        # Royal Flush / Straight Flush
        if is_flush and is_straight:
            if straight_high_card == 14:
                return HandValue(HandRank.ROYAL_FLUSH, [14])
            return HandValue(HandRank.STRAIGHT_FLUSH, [straight_high_card])

        # Four of a Kind
        if counts[0] == 4:
            quad_rank = [r for r, c in rank_counts.items() if c == 4][0]
            kicker = [r for r, c in rank_counts.items() if c == 1][0]
            return HandValue(HandRank.FOUR_OF_A_KIND, [quad_rank, kicker])

        # Full House
        if counts[0] == 3 and counts[1] == 2:
            trips_rank = [r for r, c in rank_counts.items() if c == 3][0]
            pair_rank = [r for r, c in rank_counts.items() if c == 2][0]
            return HandValue(HandRank.FULL_HOUSE, [trips_rank, pair_rank])

        # Flush
        if is_flush:
            return HandValue(HandRank.FLUSH, ranks)

        # Straight
        if is_straight:
            return HandValue(HandRank.STRAIGHT, [straight_high_card])

        # Three of a Kind
        if counts[0] == 3:
            trips_rank = [r for r, c in rank_counts.items() if c == 3][0]
            kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
            return HandValue(HandRank.THREE_OF_A_KIND, [trips_rank] + kickers)

        # Two Pair
        if counts[0] == 2 and counts[1] == 2:
            pairs = sorted([r for r, c in rank_counts.items() if c == 2], reverse=True)
            kicker = [r for r, c in rank_counts.items() if c == 1][0]
            return HandValue(HandRank.TWO_PAIR, pairs + [kicker])

        # One Pair
        if counts[0] == 2:
            pair_rank = [r for r, c in rank_counts.items() if c == 2][0]
            kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
            return HandValue(HandRank.PAIR, [pair_rank] + kickers)

        # High Card
        return HandValue(HandRank.HIGH_CARD, ranks)


def simulate_equity(
    hole_cards: List[Card],
    community_cards: List[Card],
    num_opponents: int = 1,
    num_simulations: int = 1000,
    opponent_vpip: float = 0.25
) -> Dict[str, float]:
    """Range-aware Monte Carlo simulation estimating hand equity."""
    if len(hole_cards) != 2:
        raise ValueError("Hero must have exactly 2 hole cards")

    known_strs = {str(c) for c in hole_cards + community_cards}
    all_deck = [Card(rank=r, suit=s) for r in Rank for s in Suit]
    base_sim_deck = [c for c in all_deck if str(c) not in known_strs]

    wins = 0
    ties = 0
    losses = 0

    needed_board = 5 - len(community_cards)

    for _ in range(num_simulations):
        deck_copy = base_sim_deck.copy()
        random.shuffle(deck_copy)

        sim_board = community_cards + deck_copy[:needed_board]
        deck_pos = needed_board

        hero_value = HandEvaluator.evaluate_7_cards(hole_cards + sim_board)

        sim_lost = False
        sim_tied = False

        for _ in range(num_opponents):
            opp_cards = deck_copy[deck_pos : deck_pos + 2]
            deck_pos += 2

            # Basic range awareness: tight opponents rarely hold rags
            if opponent_vpip < 0.35 and random.random() > 0.25:
                r1, r2 = RANK_VALUE[opp_cards[0].rank], RANK_VALUE[opp_cards[1].rank]
                if r1 != r2 and max(r1, r2) < 10:
                    # Reroll once from deeper in the deck
                    if deck_pos + 2 <= len(deck_copy):
                        opp_cards = deck_copy[deck_pos : deck_pos + 2]
                        deck_pos += 2

            opp_value = HandEvaluator.evaluate_7_cards(opp_cards + sim_board)

            if opp_value > hero_value:
                sim_lost = True
                break
            elif opp_value == hero_value:
                sim_tied = True

        if sim_lost:
            losses += 1
        elif sim_tied:
            ties += 1
        else:
            wins += 1

    win_prob = round((wins + (ties / 2.0)) / num_simulations, 4)
    tie_prob = round(ties / num_simulations, 4)
    loss_prob = round(losses / num_simulations, 4)
    return {
        "win_probability": win_prob,
        "tie_probability": tie_prob,
        "loss_probability": loss_prob,
        "raw_wins": wins,
        "raw_ties": ties,
        "raw_losses": losses,
        "simulations": num_simulations
    }


def calculate_math(
    win_probability: float,
    pot_size: float,
    call_amount: float
) -> Dict[str, float]:
    """Calculates Pot Odds, Required Equity, and Expected Value (EV)."""
    if call_amount <= 0:
        return {
            "pot_odds_ratio": 0.0,
            "pot_odds_percentage": 0.0,
            "required_equity": 0.0,
            "expected_value": 0.0
        }

    total_pot_after_call = pot_size + call_amount
    required_equity = round(call_amount / (pot_size + call_amount), 4)
    pot_odds_ratio = round(pot_size / call_amount, 2)
    pot_odds_pct = round(required_equity * 100, 2)

    # EV = (Win% * Pot) - (Lose% * Call)
    ev = round((win_probability * pot_size) - ((1.0 - win_probability) * call_amount), 2)

    return {
        "pot_odds_ratio": pot_odds_ratio,
        "pot_odds_percentage": pot_odds_pct,
        "required_equity": required_equity,
        "expected_value": ev
    }
