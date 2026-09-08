"""Opponent archetype profiling (VPIP/PFR based)."""


def classify_archetype(vpip: float, pfr: float) -> str:
    """Classifies player archetype based on VPIP and PFR."""
    if vpip < 0.18:
        return "Nit (Extremely Tight)"
    elif vpip <= 0.28 and pfr >= 0.15:
        return "TAG (Tight Aggressive)"
    elif vpip > 0.32 and pfr >= 0.22:
        return "LAG (Loose Aggressive)"
    elif vpip > 0.35 and pfr < 0.14:
        return "Fish / Calling Station (Loose Passive)"
    elif vpip >= 0.25 and pfr < 0.12:
        return "Passive / Rock"
    else:
        return "Standard / Semi-Aggressive"
