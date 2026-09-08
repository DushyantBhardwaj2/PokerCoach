"""Pure Python Texas Hold'em Game Engine and State Manager.

Decoupled, zero-dependency, and built from scratch for Poker Coach RAG.
"""

from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

from backend.poker.models import Card, Rank, Suit
from backend.poker.equity import HandEvaluator, HandValue, RANK_VALUE


class PlayerState(BaseModel):
    name: str
    stack: float
    hole_cards: List[Dict[str, str]] = []
    current_bet: float = 0.0
    total_contributed: float = 0.0
    is_folded: bool = False
    is_all_in: bool = False
    status: str = "active"  # "active", "folded", "all-in", "sitting-out"
    has_acted: bool = False
    vpip_this_hand: bool = False
    pfr_this_hand: bool = False
    vpip: float = 0.25
    pfr: float = 0.18
    bet: float = 0.0


class PotState(BaseModel):
    amount: float
    eligible_player_indices: List[int]


class GameStateModel(BaseModel):
    players: List[PlayerState]
    community_cards: List[Dict[str, str]] = []
    pots: List[PotState] = []
    pot: float = 0.0
    current_bet: float = 0.0
    last_raise_amount: float = 0.0
    current_player_index: int = 0
    dealer_index: int = 0
    round: str = "pre-flop"  # "pre-flop", "flop", "turn", "river", "showdown"
    street: str = "pre-flop"
    small_blind: float = 10.0
    big_blind: float = 20.0
    sessionId: Optional[str] = "session-local"


class ActionRequest(BaseModel):
    player_index: int = 0
    action_type: str  # "fold", "check", "call", "raise", "all-in"
    amount: float = 0.0


class PokerEngine:
    """Manages rules, street transitions, pots, and actions for Texas Hold'em."""

    @staticmethod
    def start_game(
        player_names: List[str],
        initial_stacks: List[float],
        small_blind: float = 10.0,
        big_blind: float = 20.0,
        dealer_index: int = 0,
        sb_index: int = -1,
        bb_index: int = -1,
    ) -> GameStateModel:
        num = len(player_names)
        if num < 2:
            raise ValueError("At least 2 players are required to play.")

        dealer = dealer_index % num
        if num == 2:
            sb = dealer
            bb = (dealer + 1) % num
        else:
            sb = (dealer + 1) % num if sb_index == -1 else sb_index % num
            bb = (dealer + 2) % num if bb_index == -1 else bb_index % num

        players: List[PlayerState] = []
        for i, name in enumerate(player_names):
            stack = float(initial_stacks[i]) if i < len(initial_stacks) else 1000.0
            players.append(PlayerState(name=name, stack=stack))

        # Post Blinds
        sb_post = min(players[sb].stack, small_blind)
        players[sb].stack -= sb_post
        players[sb].current_bet = sb_post
        players[sb].bet = sb_post
        players[sb].total_contributed = sb_post
        if players[sb].stack == 0:
            players[sb].is_all_in = True
            players[sb].status = "all-in"

        bb_post = min(players[bb].stack, big_blind)
        players[bb].stack -= bb_post
        players[bb].current_bet = bb_post
        players[bb].bet = bb_post
        players[bb].total_contributed = bb_post
        if players[bb].stack == 0:
            players[bb].is_all_in = True
            players[bb].status = "all-in"

        total_pot = sb_post + bb_post
        current_bet = bb_post
        last_raise = bb_post - sb_post if bb_post > sb_post else bb_post

        # Action starts with player after BB (UTG)
        first_actor = (bb + 1) % num
        while players[first_actor].is_folded or players[first_actor].is_all_in:
            first_actor = (first_actor + 1) % num
            if first_actor == (bb + 1) % num:
                break

        return GameStateModel(
            players=players,
            community_cards=[],
            pots=[PotState(amount=total_pot, eligible_player_indices=list(range(num)))],
            pot=total_pot,
            current_bet=current_bet,
            last_raise_amount=last_raise,
            current_player_index=first_actor,
            dealer_index=dealer,
            round="pre-flop",
            street="pre-flop",
            small_blind=small_blind,
            big_blind=big_blind,
            sessionId="session-local",
        )

    @staticmethod
    def process_action(state: GameStateModel, action: ActionRequest) -> GameStateModel:
        idx = state.current_player_index
        player = state.players[idx]
        act_type = action.action_type.lower()
        amount = float(action.amount)

        player.has_acted = True

        if act_type == "fold":
            player.is_folded = True
            player.status = "folded"

        elif act_type == "check":
            # Check is only legal if current player's bet equals current_bet
            if player.current_bet < state.current_bet:
                # Treat as call if under bet
                call_needed = min(player.stack, state.current_bet - player.current_bet)
                player.stack -= call_needed
                player.current_bet += call_needed
                player.bet = player.current_bet
                player.total_contributed += call_needed
                state.pot += call_needed
                if player.stack == 0:
                    player.is_all_in = True
                    player.status = "all-in"

        elif act_type == "call":
            call_needed = min(player.stack, state.current_bet - player.current_bet)
            player.stack -= call_needed
            player.current_bet += call_needed
            player.bet = player.current_bet
            player.total_contributed += call_needed
            player.vpip_this_hand = True
            state.pot += call_needed
            if player.stack == 0:
                player.is_all_in = True
                player.status = "all-in"

        elif act_type in ["raise", "bet"]:
            target_bet = amount
            if target_bet <= state.current_bet:
                target_bet = state.current_bet + max(state.big_blind, state.last_raise_amount)

            chips_to_add = min(player.stack, target_bet - player.current_bet)
            actual_new_bet = player.current_bet + chips_to_add
            raise_diff = actual_new_bet - state.current_bet

            player.stack -= chips_to_add
            player.current_bet = actual_new_bet
            player.bet = player.current_bet
            player.total_contributed += chips_to_add
            player.vpip_this_hand = True
            player.pfr_this_hand = True
            state.pot += chips_to_add

            if raise_diff > 0:
                state.last_raise_amount = raise_diff
                state.current_bet = actual_new_bet
                # Re-open action for other active players
                for i, p in enumerate(state.players):
                    if i != idx and not p.is_folded and not p.is_all_in:
                        p.has_acted = False

            if player.stack == 0:
                player.is_all_in = True
                player.status = "all-in"

        elif act_type == "all-in":
            all_in_amount = player.stack
            new_bet = player.current_bet + all_in_amount
            player.stack = 0
            player.current_bet = new_bet
            player.bet = new_bet
            player.total_contributed += all_in_amount
            player.is_all_in = True
            player.status = "all-in"
            player.vpip_this_hand = True
            state.pot += all_in_amount

            if new_bet > state.current_bet:
                raise_diff = new_bet - state.current_bet
                state.last_raise_amount = raise_diff
                state.current_bet = new_bet
                for i, p in enumerate(state.players):
                    if i != idx and not p.is_folded and not p.is_all_in:
                        p.has_acted = False

        # Check if only 1 active unfolded player remains
        active_unfolded = [p for p in state.players if not p.is_folded]
        if len(active_unfolded) <= 1:
            state.round = "showdown"
            state.street = "showdown"
            return state

        # Check if betting round complete
        # Complete when every non-folded, non-all-in player has acted and bet matches current_bet
        can_act_players = [p for p in state.players if not p.is_folded and not p.is_all_in]
        round_complete = True
        for p in can_act_players:
            if not p.has_acted or p.current_bet < state.current_bet:
                round_complete = False
                break

        if round_complete or len(can_act_players) <= 1:
            # Advance street
            streets = ["pre-flop", "flop", "turn", "river", "showdown"]
            curr_idx = streets.index(state.round) if state.round in streets else 0
            if curr_idx < len(streets) - 1:
                state.round = streets[curr_idx + 1]

            # Reset street bets
            for p in state.players:
                p.current_bet = 0.0
                p.bet = 0.0
                p.has_acted = False
            state.current_bet = 0.0
            state.last_raise_amount = 0.0

            # Action starts with first active player clockwise from dealer
            next_actor = (state.dealer_index + 1) % len(state.players)
            count = 0
            while (state.players[next_actor].is_folded or state.players[next_actor].is_all_in) and count < len(state.players):
                next_actor = (next_actor + 1) % len(state.players)
                count += 1
            state.current_player_index = next_actor
        else:
            # Move to next player in the current street
            next_actor = (idx + 1) % len(state.players)
            count = 0
            while (state.players[next_actor].is_folded or state.players[next_actor].is_all_in) and count < len(state.players):
                next_actor = (next_actor + 1) % len(state.players)
                count += 1
            state.current_player_index = next_actor

        state.street = state.round
        return state

    @staticmethod
    def evaluate_showdown(state: GameStateModel) -> Tuple[GameStateModel, Dict[str, Any]]:
        unfolded = [(i, p) for i, p in enumerate(state.players) if not p.is_folded]

        if len(unfolded) == 0:
            # Degenerate case: every remaining player mucked at showdown.
            state.round = "showdown"
            result = {"winners": [], "hand_rankings": {}, "payouts": {}, "pots_summary": []}
            return state, result

        if len(unfolded) == 1:
            winner_idx, winner = unfolded[0]
            winner.stack += state.pot
            payout = state.pot
            state.pot = 0.0
            state.round = "showdown"
            result = {
                "winners": [winner.name],
                "hand_rankings": {winner.name: "Last Player Standing (All Others Folded)"},
                "payouts": {winner.name: payout},
                "pots_summary": [{"amount": payout, "winner": winner.name}],
            }
            return state, result

        # Evaluate hands with community cards
        board_cards = [Card.from_str(f"{c['rank']}{c['suit']}") for c in state.community_cards if "rank" in c and "suit" in c]
        player_scores: List[Tuple[int, PlayerState, HandValue]] = []

        hand_rankings = {}
        for i, p in unfolded:
            p_cards = [Card.from_str(f"{c['rank']}{c['suit']}") for c in p.hole_cards if "rank" in c and "suit" in c]
            all_7 = p_cards + board_cards
            if len(all_7) >= 5:
                hand_val = HandEvaluator.evaluate_7_cards(all_7)
            else:
                hand_val = HandValue(rank=1, values=[1])

            player_scores.append((i, p, hand_val))
            hand_rankings[p.name] = str(hand_val.rank.name.replace("_", " ").title()) if hasattr(hand_val.rank, "name") else "High Card"

        # Find best hand
        best_score = max(player_scores, key=lambda x: x[2])[2]
        winners = [p for i, p, score in player_scores if score == best_score]

        split_pot = round(state.pot / len(winners), 2)
        payouts = {}
        for w in winners:
            w.stack += split_pot
            payouts[w.name] = split_pot

        state.pot = 0.0
        state.round = "showdown"

        result = {
            "winners": [w.name for w in winners],
            "hand_rankings": hand_rankings,
            "payouts": payouts,
            "pots_summary": [{"amount": split_pot, "winner": w.name} for w in winners],
        }
        return state, result
