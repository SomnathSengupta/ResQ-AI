"""
geocoder.py - Resolves a location string to city, state, country, lat, lng
using OpenStreetMap Nominatim (free, no API key required).

Rate limit: max 1 request/second per Nominatim ToS.
"""

import os
import time
import requests
from typing import Optional
from models import Location, Coordinates

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Nominatim requires a descriptive User-Agent with a real contact email.
# Set NOMINATIM_EMAIL in your .env — using a placeholder causes 403 errors.
_EMAIL = os.getenv("NOMINATIM_EMAIL", "disasterapi@example.com")
HEADERS = {
    "User-Agent": f"DisasterDetectionAPI/3.0 ({_EMAIL})",
    "Accept-Language": "en",
    "Referer": "https://nominatim.openstreetmap.org",
}

_last_call: float = 0.0   # track last request time for rate limiting


def geocode(location_text: str) -> Optional[Location]:
    """
    Given a location string like 'North Kolkata, West Bengal',
    returns a Location object with city, state, country and coordinates.
    Returns None if geocoding fails or location_text is empty.
    """
    if not location_text or not location_text.strip():
        return None

    # ── Rate limit: 1 req/sec ─────────────────────────────────────────────
    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)
    _last_call = time.time()

    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={
                "q": location_text,
                "format": "json",
                "limit": 1,
                "addressdetails": 1,
            },
            headers=HEADERS,
            timeout=5,
        )
        resp.raise_for_status()
        results = resp.json()

        if not results:
            return None

        top = results[0]
        addr = top.get("address", {})

        city = (
            addr.get("city")
            or addr.get("town")
            or addr.get("village")
            or addr.get("county")
        )
        state   = addr.get("state")
        country = addr.get("country")
        lat     = float(top["lat"])
        lng     = float(top["lon"])

        return Location(
            city=city,
            state=state,
            country=country,
            coordinates=Coordinates(lat=lat, lng=lng),
        )

    except Exception as e:
        print(f"[Geocoder] Failed for '{location_text}': {e}")
        return None