"""Self-pinging Keep-Alive background service.

Prevents hosting platforms (such as Render free tier) from sleeping by making
an outbound HTTP GET request to the public backend health endpoint every 10 minutes.
This resets the platform's inactivity timer and eliminates cold starts for visitors
arriving from LinkedIn and elsewhere.
"""

import asyncio
import logging
import os
import time
import urllib.request
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("keep_alive")
logger.setLevel(logging.INFO)


class KeepAliveService:
    def __init__(self):
        # Public URL to hit. Prefers explicit env, then Render's automatic env, then known URL
        self.base_url = (
            os.getenv("SELF_PING_URL")
            or os.getenv("RENDER_EXTERNAL_URL")
            or "https://poker-coach-backend.onrender.com"
        ).rstrip("/")
        
        self.health_path = "/health"
        # 10 minutes = 600 seconds. Render spins down after 15 minutes of inactivity.
        self.interval_seconds = int(os.getenv("KEEP_ALIVE_INTERVAL_SECONDS", "600"))
        
        self._task: Optional[asyncio.Task] = None
        self._is_running = False
        
        # Diagnostics
        self.started_at: Optional[str] = None
        self.total_pings = 0
        self.successful_pings = 0
        self.failed_pings = 0
        self.last_ping_time: Optional[str] = None
        self.last_status_code: Optional[int] = None
        self.last_latency_ms: Optional[float] = None
        self.last_error: Optional[str] = None

    @property
    def target_url(self) -> str:
        return f"{self.base_url}{self.health_path}"

    async def _ping_target(self) -> Dict[str, Any]:
        """Performs a single HTTP GET request to keep the backend warm."""
        start = time.time()
        url = self.target_url
        logger.info(f"[KeepAlive] Initiating self-ping to {url}")
        
        def _execute_req():
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "PokerSense-KeepAlive-Bot/1.0 (+https://poker-coach-lake.vercel.app)",
                    "Accept": "application/json",
                },
                method="GET",
            )
            # 20 second timeout to prevent hanging connections
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.status

        try:
            # Run in worker thread so async event loop isn't blocked by network I/O
            status_code = await asyncio.to_thread(_execute_req)
            elapsed = (time.time() - start) * 1000
            
            self.total_pings += 1
            self.successful_pings += 1
            self.last_ping_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            self.last_status_code = status_code
            self.last_latency_ms = round(elapsed, 1)
            self.last_error = None
            
            logger.info(f"[KeepAlive] Ping SUCCESS {status_code} in {elapsed:.1f}ms")
            return {
                "success": True,
                "status_code": status_code,
                "latency_ms": round(elapsed, 1),
                "timestamp": self.last_ping_time,
                "url": url,
            }
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            self.total_pings += 1
            self.failed_pings += 1
            self.last_ping_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            self.last_status_code = getattr(e, "code", None)
            self.last_latency_ms = round(elapsed, 1)
            self.last_error = str(e)
            
            logger.warning(f"[KeepAlive] Ping failed for {url}: {e}")
            return {
                "success": False,
                "error": str(e),
                "latency_ms": round(elapsed, 1),
                "timestamp": self.last_ping_time,
                "url": url,
            }

    async def _run_loop(self):
        """Infinite loop pinging the backend periodically."""
        # Initial boot delay (45 seconds) so the server finishes startup and is ready to accept requests
        await asyncio.sleep(45)
        
        while self._is_running:
            try:
                await self._ping_target()
            except Exception as e:
                logger.error(f"[KeepAlive] Unexpected error in ping loop: {e}")

            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break

    def start(self):
        """Starts the background pinger task if not already running."""
        if self._is_running:
            return
        self._is_running = True
        self.started_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"[KeepAlive] Background service started (Target: {self.target_url}, Interval: {self.interval_seconds}s)")

    def stop(self):
        """Gracefully cancels the background pinger."""
        self._is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("[KeepAlive] Background service stopped")

    async def ping_now(self) -> Dict[str, Any]:
        """Manually triggers an immediate ping on demand."""
        return await self._ping_target()

    def get_status(self) -> Dict[str, Any]:
        """Returns the current diagnostics and heartbeat state."""
        return {
            "active": self._is_running,
            "target_url": self.target_url,
            "interval_seconds": self.interval_seconds,
            "interval_minutes": round(self.interval_seconds / 60, 1),
            "started_at": self.started_at,
            "total_pings": self.total_pings,
            "successful_pings": self.successful_pings,
            "failed_pings": self.failed_pings,
            "last_ping_time": self.last_ping_time,
            "last_status_code": self.last_status_code,
            "last_latency_ms": self.last_latency_ms,
            "last_error": self.last_error,
        }


# Global singleton instance
keep_alive_service = KeepAliveService()
