"""Per-user PostgreSQL stats repository.

Ports the former in-memory ``StatsStore`` to SQLAlchemy, scoping every read and
write by ``user_id`` so the three demo logins keep isolated data. The archetype
and rate math mirror the original ``backend/poker/stats.py`` exactly.
"""

import time
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db.models import OpponentProfileRow, HandRecordRow

_MAX_HISTORY = 500


def _now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


class StatsRepo:
    """All methods take an explicit ``user_id`` and a live SQLAlchemy ``Session``."""

    def __init__(self, db: Session):
        self.db = db

    # --- Opponent profiles ---

    def get_or_create(self, user_id: int, name: str) -> OpponentProfileRow:
        clean = name.strip()
        row = self.db.scalar(
            select(OpponentProfileRow).where(
                OpponentProfileRow.user_id == user_id,
                OpponentProfileRow.name.ilike(clean),
            )
        )
        if row is None:
            row = OpponentProfileRow(user_id=user_id, name=clean, last_seen=_now())
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)
        return row

    def update_hand(
        self,
        user_id: int,
        name: str,
        vpip: bool,
        pfr: bool,
        won_showdown: Optional[bool] = None,
        made_cbet: bool = False,
        cbet_succeeded: bool = False,
        made_three_bet: bool = False,
        three_bet_succeeded: bool = False,
        fold_to_river: bool = False,
        called_showdown: bool = False,
    ) -> OpponentProfileRow:
        row = self.get_or_create(user_id, name)
        row.total_hands += 1
        row.hands_played += 1
        if vpip:
            row.vpip_count += 1
        if pfr:
            row.pfr_count += 1
        if made_cbet:
            row.cbet_count += 1
            if cbet_succeeded:
                row.cbet_success_count += 1
        if made_three_bet:
            row.three_bet_count += 1
            if three_bet_succeeded:
                row.three_bet_success_count += 1
        if fold_to_river:
            row.fold_to_river_count += 1
        if won_showdown is not None:
            row.showdowns_total += 1
            if won_showdown:
                row.showdowns_won += 1
        if called_showdown:
            row.called_showdown_count += 1
        row.last_seen = _now()
        self.db.commit()
        self.db.refresh(row)
        return row

    def update_notes(self, user_id: int, name: str, notes: str) -> None:
        row = self.get_or_create(user_id, name)
        row.notes = notes
        self.db.commit()

    def _row_to_profile(self, s: OpponentProfileRow) -> Dict[str, Any]:
        vpip_pct = round(s.vpip_count / s.hands_played, 2) if s.hands_played > 0 else 0.25
        pfr_pct = round(s.pfr_count / s.hands_played, 2) if s.hands_played > 0 else 0.18

        if vpip_pct < 0.18:
            archetype = "Nit (Extremely Tight)"
        elif vpip_pct <= 0.28 and pfr_pct >= 0.15:
            archetype = "TAG (Tight Aggressive)"
        elif vpip_pct > 0.32 and pfr_pct >= 0.22:
            archetype = "LAG (Loose Aggressive)"
        elif vpip_pct > 0.35:
            archetype = "Fish / Calling Station"
        else:
            archetype = "Standard / Balanced"

        cbet_rate = round(s.cbet_success_count / s.cbet_count, 2) if s.cbet_count > 0 else 0.0
        three_bet_rate = round(s.three_bet_count / s.hands_played, 2) if s.hands_played > 0 else 0.0
        fold_to_river = round(s.fold_to_river_count / s.hands_played, 2) if s.hands_played > 0 else 0.0

        session_vpip = vpip_pct
        is_shifting = False
        shift_direction = "stable"
        if s.hands_played >= 10:
            if vpip_pct > 0.4:
                is_shifting = True
                shift_direction = "more_aggressive"
            elif vpip_pct < 0.15:
                is_shifting = True
                shift_direction = "more_passive"

        return {
            "total_hands": s.total_hands,
            "hands_played": s.hands_played,
            "vpip": vpip_pct,
            "pfr": pfr_pct,
            "aggression": round(pfr_pct / max(0.01, vpip_pct - pfr_pct), 2),
            "cbet_success_rate": cbet_rate,
            "three_bet_rate": three_bet_rate,
            "fold_to_river": fold_to_river,
            "wtsd": round(s.called_showdown_count / max(1, s.hands_played), 2),
            "archetype": archetype,
            "reliability": "High" if s.hands_played >= 15 else ("Medium" if s.hands_played >= 5 else "Low"),
            "notes": s.notes or "",
            "last_seen": s.last_seen,
            "cbet_rate": cbet_rate,
            "session_vpip": session_vpip,
            "is_shifting": is_shifting,
            "shift_direction": shift_direction,
        }

    def get_all(self, user_id: int) -> Dict[str, Dict[str, Any]]:
        rows = self.db.scalars(
            select(OpponentProfileRow).where(OpponentProfileRow.user_id == user_id)
        ).all()
        return {r.name: self._row_to_profile(r) for r in rows}

    def get_profile(self, user_id: int, name: str) -> Dict[str, Any]:
        row = self.get_or_create(user_id, name)
        return self._row_to_profile(row)

    # --- Hand history ---

    def record_hand(
        self,
        user_id: int,
        session_id: Optional[str],
        result: str,
        amount_won: float,
        street: str,
        pot_size: float,
        your_cards: Optional[List[Dict[str, str]]] = None,
        community_cards: Optional[List[Dict[str, str]]] = None,
        action_count: int = 0,
        duration_seconds: float = 0.0,
        tactical_data: Optional[Dict[str, Any]] = None,
    ) -> HandRecordRow:
        record = HandRecordRow(
            user_id=user_id,
            hand_id=f"hand_{uuid.uuid4().hex[:12]}",
            session_id=session_id,
            street=street,
            pot_size=pot_size,
            your_cards=your_cards or [],
            community_cards=community_cards or [],
            result=result,
            amount_won=amount_won,
            action_count=action_count,
            duration_seconds=duration_seconds,
            tactical_data=tactical_data,
            timestamp=_now(),
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        self._trim_history(user_id)
        return record

    def _trim_history(self, user_id: int) -> None:
        """Keeps at most _MAX_HISTORY rows per user (oldest pruned)."""
        ids = self.db.scalars(
            select(HandRecordRow.id)
            .where(HandRecordRow.user_id == user_id)
            .order_by(HandRecordRow.id.desc())
            .offset(_MAX_HISTORY)
        ).all()
        if ids:
            for stale in self.db.scalars(
                select(HandRecordRow).where(HandRecordRow.id.in_(ids))
            ).all():
                self.db.delete(stale)
            self.db.commit()

    def _hand_to_dict(self, h: HandRecordRow) -> Dict[str, Any]:
        return {
            "hand_id": h.hand_id,
            "session_id": h.session_id,
            "street": h.street,
            "pot_size": h.pot_size,
            "your_cards": h.your_cards or [],
            "community_cards": h.community_cards or [],
            "result": h.result,
            "amount_won": h.amount_won,
            "action_count": h.action_count,
            "duration_seconds": h.duration_seconds,
            "tactical_data": h.tactical_data,
            "timestamp": h.timestamp,
        }

    def get_history(self, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        rows = self.db.scalars(
            select(HandRecordRow)
            .where(HandRecordRow.user_id == user_id)
            .order_by(HandRecordRow.id.desc())
            .limit(limit)
        ).all()
        return [self._hand_to_dict(h) for h in rows]

    def get_session_analytics(
        self, user_id: int, session_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        all_hands = self.db.scalars(
            select(HandRecordRow)
            .where(HandRecordRow.user_id == user_id)
            .order_by(HandRecordRow.id.asc())
        ).all()
        if not all_hands:
            return None

        if session_id:
            hands = [h for h in all_hands if h.session_id == session_id]
        else:
            latest_sid = all_hands[-1].session_id
            if latest_sid:
                hands = [h for h in all_hands if h.session_id == latest_sid]
            else:
                hands = [h for h in all_hands if h.session_id is None]

        if not hands:
            return None

        sid = session_id or hands[-1].session_id or "local"
        total_hands = len(hands)
        wins = [h for h in hands if h.result == "win"]
        losses = [h for h in hands if h.result == "loss"]
        showdown_hands = [h for h in hands if h.street == "showdown" or h.result in ("win", "loss")]
        total_winnings = sum(h.amount_won for h in hands)
        durations = [h.duration_seconds for h in hands if h.duration_seconds > 0]

        summary = {
            "session_id": sid,
            "start_time": hands[0].timestamp,
            "end_time": hands[-1].timestamp,
            "total_hands": total_hands,
            "hands_played": total_hands,
            "vpip_hands": total_hands,
            "pfr_hands": 0,
            "total_winnings": round(total_winnings, 2),
            "biggest_pot": max((h.pot_size for h in hands), default=0.0),
            "biggest_loss": round(min((h.amount_won for h in hands), default=0.0), 2),
            "showdown_wins": len(wins),
            "showdown_losses": len(losses),
            "folds": sum(1 for h in hands if h.street != "showdown" and h.result == "loss"),
            "avg_position": 0.0,
        }

        return {
            "summary": summary,
            "recent_hands": [self._hand_to_dict(h) for h in reversed(hands[-20:])],
            "vpip_percentage": 1.0 if total_hands else 0.0,
            "pfr_percentage": 0.0,
            "win_rate": round(len(wins) / total_hands, 3) if total_hands else 0.0,
            "showdown_rate": round(len(showdown_hands) / total_hands, 3) if total_hands else 0.0,
            "avg_hand_duration": round(sum(durations) / len(durations), 2) if durations else 0.0,
            "most_played_opponent": None,
        }

    def get_recent_opponents(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        rows = self.db.scalars(
            select(OpponentProfileRow)
            .where(OpponentProfileRow.user_id == user_id)
            .order_by(OpponentProfileRow.last_seen.desc())
            .limit(limit)
        ).all()
        results = []
        for r in rows:
            prof = self._row_to_profile(r)
            results.append({
                "player_name": r.name,
                "archetype": prof["archetype"],
                "last_seen": r.last_seen,
                "hands_played": r.hands_played,
            })
        return results

    def reset(self, user_id: int) -> None:
        """Clears this user's opponents and hand history only."""
        for row in self.db.scalars(
            select(OpponentProfileRow).where(OpponentProfileRow.user_id == user_id)
        ).all():
            self.db.delete(row)
        for hand in self.db.scalars(
            select(HandRecordRow).where(HandRecordRow.user_id == user_id)
        ).all():
            self.db.delete(hand)
        self.db.commit()
