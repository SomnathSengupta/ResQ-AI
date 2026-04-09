"""
cache.py - In-memory fetch cache.

Stores raw Reddit fetch batches temporarily (keyed by fetch_id) so that
POST /gemini/verify can retrieve them without hitting Reddit again.

Batches expire after CACHE_TTL_SECONDS (default 30 min) to avoid memory bloat.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from models import RawRedditPost

CACHE_TTL_SECONDS = 60 * 30  # 30 minutes


class FetchCache:
    def __init__(self):
        self._store: Dict[str, dict] = {}

    def save(self, posts: List[RawRedditPost]) -> str:
        """Store a list of posts and return a unique fetch_id."""
        fetch_id = str(uuid.uuid4())
        self._store[fetch_id] = {
            "posts": {p.reddit_id: p for p in posts},  # keyed by reddit_id for fast lookup
            "expires_at": datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_SECONDS),
        }
        self._evict_expired()
        return fetch_id

    def get(self, fetch_id: str, reddit_ids: Optional[List[str]] = None) -> List[RawRedditPost]:
        """
        Retrieve posts from a fetch batch.
        If reddit_ids is provided, return only those specific posts.
        Raises KeyError if fetch_id is not found or expired.
        """
        self._evict_expired()
        if fetch_id not in self._store:
            raise KeyError(f"fetch_id '{fetch_id}' not found or expired (TTL: {CACHE_TTL_SECONDS}s).")

        all_posts: Dict[str, RawRedditPost] = self._store[fetch_id]["posts"]

        if reddit_ids:
            missing = [rid for rid in reddit_ids if rid not in all_posts]
            if missing:
                raise KeyError(f"reddit_ids not found in this batch: {missing}")
            return [all_posts[rid] for rid in reddit_ids]

        return list(all_posts.values())

    def delete(self, fetch_id: str) -> None:
        """Remove a batch from cache after it has been fully verified."""
        self._store.pop(fetch_id, None)

    def _evict_expired(self) -> None:
        now = datetime.now(timezone.utc)
        expired = [fid for fid, v in self._store.items() if v["expires_at"] < now]
        for fid in expired:
            del self._store[fid]


# Singleton used across the app
fetch_cache = FetchCache()
