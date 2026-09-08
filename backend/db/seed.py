"""Idempotent demo seeding.

Ensures the three preset demo users exist and each has an isolated, preloaded set
of opponent profiles and a few hand records so the coach and analytics views have
something to show immediately. Safe to run on every startup: users are matched by
username, and preloading is skipped for any user that already has data.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.config import DEMO_USERS
from backend.db.models import User, OpponentProfileRow, HandRecordRow
from backend.db.session import SessionLocal


# Per-user preloaded opponents. Counts are chosen so archetypes classify cleanly
# and reliability tiers vary, giving each demo login a distinct table read.
_PRELOAD = {
    "demo1": {
        "opponents": [
            # name, hands_played, vpip_count, pfr_count, notes
            ("The Rock", 22, 3, 2, "Only plays premiums. Fold to his raises."),
            ("Loose Larry", 18, 11, 3, "Calls everything. Value bet relentlessly, never bluff."),
            ("Balanced Bob", 15, 4, 3, "Solid regular. Respect his 3-bets."),
        ],
        "hands": [
            ("win", 120.0, "showdown", 240.0, 8, 42.0),
            ("loss", -40.0, "river", 90.0, 6, 28.0),
            ("win", 65.0, "showdown", 130.0, 5, 33.0),
        ],
    },
    "demo2": {
        "opponents": [
            ("Maniac Mike", 20, 13, 9, "Hyper-aggressive. Let him bluff into strong hands."),
            ("Nervous Nancy", 16, 2, 1, "Very tight. Steal blinds relentlessly."),
        ],
        "hands": [
            ("loss", -80.0, "river", 160.0, 7, 51.0),
            ("win", 210.0, "showdown", 420.0, 9, 60.0),
        ],
    },
    "demo3": {
        "opponents": [
            ("Grinder Grace", 30, 8, 6, "Textbook TAG. Avoid marginal spots out of position."),
        ],
        "hands": [
            ("tie", 0.0, "showdown", 100.0, 4, 22.0),
            ("win", 55.0, "showdown", 110.0, 5, 30.0),
            ("loss", -25.0, "flop", 50.0, 3, 15.0),
        ],
    },
}


def _ensure_user(db: Session, username: str, display_name: str) -> User:
    user = db.scalar(select(User).where(User.username == username))
    if user is None:
        user = User(username=username, display_name=display_name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        for demo in DEMO_USERS:
            user = _ensure_user(db, demo.username, demo.display_name)

            # Skip preloading if this user already has any data (idempotent).
            has_data = db.scalar(
                select(OpponentProfileRow.id).where(OpponentProfileRow.user_id == user.id).limit(1)
            )
            if has_data is not None:
                continue

            preload = _PRELOAD.get(demo.username)
            if not preload:
                continue

            for name, hands_played, vpip_count, pfr_count, notes in preload["opponents"]:
                db.add(OpponentProfileRow(
                    user_id=user.id,
                    name=name,
                    total_hands=hands_played,
                    hands_played=hands_played,
                    vpip_count=vpip_count,
                    pfr_count=pfr_count,
                    showdowns_total=max(1, hands_played // 3),
                    showdowns_won=max(0, hands_played // 6),
                    called_showdown_count=max(1, hands_played // 4),
                    notes=notes,
                    last_seen="2026-09-06 12:00:00",
                ))

            session_id = f"seed_{demo.username}"
            for i, (result, amount, street, pot, actions, dur) in enumerate(preload["hands"]):
                db.add(HandRecordRow(
                    user_id=user.id,
                    hand_id=f"seed_{demo.username}_{i}",
                    session_id=session_id,
                    street=street,
                    pot_size=pot,
                    your_cards=[{"rank": "A", "suit": "s"}, {"rank": "K", "suit": "s"}],
                    community_cards=[],
                    result=result,
                    amount_won=amount,
                    action_count=actions,
                    duration_seconds=dur,
                    tactical_data=None,
                    timestamp="2026-09-06 12:00:00",
                ))

            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    from backend.db.session import init_db
    init_db()
    seed_demo_data()
    print("Demo users seeded.")
