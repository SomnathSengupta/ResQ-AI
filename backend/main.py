from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import Optional
import praw
from google import genai
import os
from dotenv import load_dotenv

from db import get_db, upsert_document, query_documents
from cache import fetch_cache
from models import (
    RawRedditPost, DisasterDocument,
    FetchResponse, VerifyRequest, VerifyResponse, DisasterResponse,
)
from reddit_fetcher import fetch_disaster_posts
from gemini_verifier import verify_post

load_dotenv()

REQUIRED_VARS = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "GEMINI_API_KEY", "MONGO_URI"]
missing = [v for v in REQUIRED_VARS if not os.getenv(v)]
if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT", "DisasterAPI/1.0"),
)
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
db = get_db()

app = FastAPI(
    title="🌍 Disaster Detection API",
    description="""
## How to use (3 steps)

### Step 1 — `POST /reddit/fetch`
Fetch disaster-related Reddit posts. All params have defaults — just click **Try it out → Execute**.
Copy the **`fetch_id`** from the response.

### Step 2 — `POST /gemini/verify`
Paste the `fetch_id` into the request body and click Execute.
Gemini verifies each post, geocodes the location via OpenStreetMap, and saves confirmed disasters to MongoDB.

### Step 3 — `GET /disasters/stored`
Query saved disasters. Filter by type, urgency, category, city, country, and more.
    """,
    version="3.0.0",
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# ════════════════════════════════════════════════════════════════════════════
# STEP 1 — Reddit Fetch
# ════════════════════════════════════════════════════════════════════════════

@app.post("/reddit/fetch", response_model=FetchResponse, tags=["Step 1 — Reddit Fetch"], summary="Fetch disaster posts from Reddit")
def reddit_fetch(
    subreddits: str = Query(
        default="news,worldnews,india,NaturalDisasters,extremeweather,australia,japan,Philippines,california,florida,hurricane,tornado,wildfires,flooding",
        description="Comma-separated subreddit names",
    ),
    limit: int = Query(default=5, ge=1, le=100, description="Posts to scan per subreddit"),
    total_limit: int = Query(default=20, ge=1, le=500, description="Max total posts across all subreddits"),
    disaster_type: Optional[str] = Query(default=None, description="Filter to one type e.g. flood, earthquake"),
    from_timestamp: Optional[int] = Query(default=None, description="Unix UTC start time"),
    to_timestamp: Optional[int] = Query(default=None, description="Unix UTC end time"),
):
    """
    **STEP 1** — Pulls Reddit posts matching disaster keywords.

    All params have defaults. Click **Try it out → Execute** right away.
    Copy the **`fetch_id`** from the response → paste into **POST /gemini/verify**.

    > Batches expire after **30 minutes**.
    """
    sub_list = [s.strip() for s in subreddits.split(",") if s.strip()]
    if not sub_list:
        raise HTTPException(status_code=400, detail="At least one subreddit is required.")

    posts = fetch_disaster_posts(
        reddit=reddit,
        subreddits=sub_list,
        limit=limit,
        disaster_type=disaster_type,
        from_ts=from_timestamp,
        to_ts=to_timestamp,
    )

    if not posts:
        raise HTTPException(status_code=404, detail="No disaster-related posts found.")

    posts = posts[:total_limit]
    fetch_id = fetch_cache.save(posts)

    return FetchResponse(
        fetch_id=fetch_id,
        total=len(posts),
        fetched_at=datetime.now(timezone.utc).isoformat(),
        posts=posts,
    )


# ════════════════════════════════════════════════════════════════════════════
# STEP 2 — Gemini Verification + Geocoding
# ════════════════════════════════════════════════════════════════════════════

@app.post("/gemini/verify", response_model=VerifyResponse, tags=["Step 2 — Gemini Verify"], summary="Verify posts with Gemini + geocode location")
def gemini_verify(body: VerifyRequest):
    """
    **STEP 2** — Runs Gemini AI on each fetched post.

    Paste the `fetch_id` from Step 1. Leave `reddit_ids` as null to verify all posts.

    For each confirmed disaster Gemini:
    - Classifies category (Rescue / Relief / Damage / Warning / Casualty)
    - Rates urgency (1–5) and credibility (High / Medium / Low)
    - Extracts location → geocoded to city, state, country + coordinates via OpenStreetMap
    - Only confirmed disasters (`is_disaster: true`) are saved to MongoDB
    """
    try:
        posts = fetch_cache.get(body.fetch_id, reddit_ids=body.reddit_ids)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

    results: list[DisasterDocument] = []
    saved_count = 0
    rejected_count = 0

    for post in posts:
        doc = verify_post(gemini_client, post)

        if doc.ai_analysis is not None:   # ai_analysis is only set for confirmed disasters
            upsert_document(db, doc)
            doc.is_saved = True
            saved_count += 1
        else:
            rejected_count += 1

        results.append(doc)

    return VerifyResponse(
        total_verified=len(results),
        total_saved=saved_count,
        total_rejected=rejected_count,
        verified_at=datetime.now(timezone.utc).isoformat(),
        posts=results,
    )


# ════════════════════════════════════════════════════════════════════════════
# STEP 3 — Query MongoDB
# ════════════════════════════════════════════════════════════════════════════

@app.get("/disasters/stored", response_model=DisasterResponse, tags=["Step 3 — Stored Disasters"], summary="Query verified disasters from MongoDB")
def get_stored_disasters(
    disaster_type: Optional[str] = Query(default=None, description="e.g. Flood, Earthquake, Wildfire"),
    status: Optional[str] = Query(default=None, description="active / inactive"),
    category: Optional[str] = Query(default=None, description="Rescue / Relief / Damage / Warning / Casualty"),
    min_urgency: Optional[int] = Query(default=None, ge=1, le=5, description="Minimum urgency level (1–5)"),
    city: Optional[str] = Query(default=None, description="Filter by city name"),
    country: Optional[str] = Query(default=None, description="Filter by country name"),
    from_timestamp: Optional[int] = Query(default=None, description="Unix UTC start time"),
    to_timestamp: Optional[int] = Query(default=None, description="Unix UTC end time"),
    limit: int = Query(default=50, ge=1, le=500),
):
    """
    **STEP 3** — Query verified disasters saved in MongoDB.

    All filters are optional — leave everything empty to get the latest 50 results.
    """
    docs = query_documents(
        db,
        disaster_type=disaster_type,
        from_ts=from_timestamp,
        to_ts=to_timestamp,
        status=status,
        category=category,
        min_urgency=min_urgency,
        city=city,
        country=country,
        limit=limit,
    )
    return DisasterResponse(
        total=len(docs),
        fetched_at=datetime.now(timezone.utc).isoformat(),
        posts=docs,
    )


# ════════════════════════════════════════════════════════════════════════════
# Utility
# ════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "version": "3.0.0",
        "steps": {
            "1": "POST /reddit/fetch   → get fetch_id",
            "2": "POST /gemini/verify  → verify + geocode → save to MongoDB",
            "3": "GET  /disasters/stored → query results",
        },
    }
