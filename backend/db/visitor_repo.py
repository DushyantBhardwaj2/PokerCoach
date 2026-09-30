"""Repository for recording website visits and retrieving platform insights.

Supports tracking unique IP addresses, LinkedIn / social referrers, route paths,
browser/device classifications, and real-time visitor logs.
"""

import re
from datetime import datetime, time
from typing import Any, Dict, List, Optional
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from backend.db.models import VisitorLog


def parse_user_agent(ua: Optional[str]) -> Dict[str, str]:
    """Lightweight user-agent analyzer that requires no external dependencies."""
    if not ua:
        return {"browser": "Unknown", "os": "Unknown", "device_type": "desktop"}

    ua_lower = ua.lower()

    # Detect Device
    if "ipad" in ua_lower or "tablet" in ua_lower:
        device_type = "tablet"
    elif "mobile" in ua_lower or "android" in ua_lower or "iphone" in ua_lower:
        device_type = "mobile"
    else:
        device_type = "desktop"

    # Detect OS
    if "windows" in ua_lower:
        os_name = "Windows"
    elif "macintosh" in ua_lower or "mac os x" in ua_lower:
        os_name = "macOS"
    elif "iphone" in ua_lower or "ipad" in ua_lower or "ios" in ua_lower:
        os_name = "iOS"
    elif "android" in ua_lower:
        os_name = "Android"
    elif "linux" in ua_lower:
        os_name = "Linux"
    else:
        os_name = "Other"

    # Detect Browser (including in-app webviews like LinkedIn)
    if "linkedinapp" in ua_lower or "linkedin" in ua_lower:
        browser = "LinkedIn App"
    elif "edg" in ua_lower:
        browser = "Edge"
    elif "chrome" in ua_lower and "chromium" not in ua_lower:
        browser = "Chrome"
    elif "firefox" in ua_lower:
        browser = "Firefox"
    elif "safari" in ua_lower and "chrome" not in ua_lower:
        browser = "Safari"
    elif "opr" in ua_lower or "opera" in ua_lower:
        browser = "Opera"
    else:
        browser = "Other"

    return {"browser": browser, "os": os_name, "device_type": device_type}


def normalize_referrer(ref: Optional[str]) -> str:
    """Categorizes referrer URLs into friendly channel names."""
    if not ref or not ref.strip():
        return "Direct / Bookmark"
    ref_lower = ref.lower().strip()
    if "linkedin.com" in ref_lower or "lnkd.in" in ref_lower:
        return "LinkedIn"
    if "twitter.com" in ref_lower or "x.com" in ref_lower or "t.co" in ref_lower:
        return "Twitter / X"
    if "google.com" in ref_lower:
        return "Google Search"
    if "github.com" in ref_lower:
        return "GitHub"
    if "facebook.com" in ref_lower or "fb.com" in ref_lower:
        return "Facebook"
    if "reddit.com" in ref_lower:
        return "Reddit"
    
    # Strip protocol and path if too long
    clean = re.sub(r"^https?://(www\.)?", "", ref_lower)
    domain = clean.split("/")[0]
    return domain or "Other External"


class VisitorRepo:
    def __init__(self, db: Session):
        self.db = db

    def record_visit(
        self,
        ip_address: str,
        path: str = "/",
        referrer: Optional[str] = None,
        session_id: Optional[str] = None,
        user_id: Optional[int] = None,
        user_agent: Optional[str] = None,
        country: Optional[str] = None,
        city: Optional[str] = None,
    ) -> VisitorLog:
        """Records a visit. Computes whether the IP is a first-time visitor."""
        clean_ip = ip_address.strip()
        
        # Check if this IP has ever been seen before
        prior_count = (
            self.db.query(func.count(VisitorLog.id))
            .filter(VisitorLog.ip_address == clean_ip)
            .scalar()
            or 0
        )
        is_new_visitor = prior_count == 0

        ua_info = parse_user_agent(user_agent)
        channel = normalize_referrer(referrer)

        record = VisitorLog(
            ip_address=clean_ip,
            session_id=session_id,
            user_id=user_id,
            path=path or "/",
            referrer=channel,
            country=country,
            city=city,
            device_type=ua_info["device_type"],
            browser=ua_info["browser"],
            os=ua_info["os"],
            user_agent=user_agent[:1000] if user_agent else None,
            is_new_visitor=is_new_visitor,
            created_at=datetime.utcnow(),
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_insights(self, limit_recent: int = 50) -> Dict[str, Any]:
        """Aggregates high-level metrics and returns recent visitor events."""
        total_visits = self.db.query(func.count(VisitorLog.id)).scalar() or 0
        unique_ips = (
            self.db.query(func.count(func.distinct(VisitorLog.ip_address))).scalar() or 0
        )

        # Today's date (UTC)
        today_midnight = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        visits_today = (
            self.db.query(func.count(VisitorLog.id))
            .filter(VisitorLog.created_at >= today_midnight)
            .scalar()
            or 0
        )
        new_visitors_today = (
            self.db.query(func.count(func.distinct(VisitorLog.ip_address)))
            .filter(
                VisitorLog.created_at >= today_midnight,
                VisitorLog.is_new_visitor == True,
            )
            .scalar()
            or 0
        )

        # Top Referrers
        referrer_rows = (
            self.db.query(
                VisitorLog.referrer,
                func.count(VisitorLog.id).label("count"),
            )
            .group_by(VisitorLog.referrer)
            .order_by(desc("count"))
            .limit(8)
            .all()
        )
        top_referrers = [
            {"source": r[0] or "Direct / Bookmark", "count": r[1]} for r in referrer_rows
        ]

        # Top Pages
        path_rows = (
            self.db.query(
                VisitorLog.path,
                func.count(VisitorLog.id).label("count"),
            )
            .group_by(VisitorLog.path)
            .order_by(desc("count"))
            .limit(8)
            .all()
        )
        top_pages = [{"path": p[0], "count": p[1]} for p in path_rows]

        # Device Breakdown
        device_rows = (
            self.db.query(
                VisitorLog.device_type,
                func.count(VisitorLog.id).label("count"),
            )
            .group_by(VisitorLog.device_type)
            .all()
        )
        devices = {d[0] or "desktop": d[1] for d in device_rows}

        # Browser Breakdown
        browser_rows = (
            self.db.query(
                VisitorLog.browser,
                func.count(VisitorLog.id).label("count"),
            )
            .group_by(VisitorLog.browser)
            .order_by(desc("count"))
            .limit(6)
            .all()
        )
        browsers = [{"name": b[0] or "Other", "count": b[1]} for b in browser_rows]

        # Recent Visitor Log
        recent_rows = (
            self.db.query(VisitorLog)
            .order_by(desc(VisitorLog.created_at))
            .limit(limit_recent)
            .all()
        )

        recent_visits = [
            {
                "id": r.id,
                "ip_address": r.ip_address,
                "path": r.path,
                "referrer": r.referrer or "Direct",
                "country": r.country,
                "city": r.city,
                "device_type": r.device_type,
                "browser": r.browser,
                "os": r.os,
                "is_new_visitor": r.is_new_visitor,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if r.created_at else None,
                "timestamp_iso": r.created_at.isoformat() + "Z" if r.created_at else None,
            }
            for r in recent_rows
        ]

        return {
            "total_visits": total_visits,
            "unique_visitors": unique_ips,
            "visits_today": visits_today,
            "new_visitors_today": new_visitors_today,
            "top_referrers": top_referrers,
            "top_pages": top_pages,
            "devices": devices,
            "browsers": browsers,
            "recent_visits": recent_visits,
        }
