from pydantic import BaseModel, Field
from typing import Optional, List


# ── Sub-models ────────────────────────────────────────────────────────────────

class Coordinates(BaseModel):
    lat: float
    lng: float


class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    coordinates: Optional[Coordinates] = None


class AiAnalysis(BaseModel):
    category: str = Field(..., description="e.g. Rescue, Relief, Damage, Warning, Casualty")
    urgency: int = Field(..., ge=1, le=5, description="1 = low urgency, 5 = critical")
    credibility: str = Field(..., description="High / Medium / Low")
    summary: str = Field(..., description="One-sentence summary of the event")


# ── Core disaster document (what gets stored in MongoDB) ──────────────────────

class DisasterDocument(BaseModel):
    reddit_id: str                          # internal dedup key
    source: str = Field(default="reddit")
    source_url: str
    disaster_type: str
    original_text: str                      # title + description combined
    location: Optional[Location] = None
    ai_analysis: Optional[AiAnalysis] = None
    status: str = Field(default="active", description="active / inactive")
    created_at: str
    fetched_at: str
    is_saved: bool = Field(default=False)


# ── Raw Reddit post (used internally during fetch, not stored) ────────────────

class RawRedditPost(BaseModel):
    reddit_id: str
    title: str
    subreddit: str
    author: str
    score: int
    upvote_ratio: float
    num_comments: int
    flair: Optional[str] = None
    url: str
    permalink: str
    thumbnail: Optional[str] = None
    description: Optional[str] = None
    disaster_type: str
    created_at: str
    fetched_at: str


# ── Gemini raw output ─────────────────────────────────────────────────────────

class GeminiResult(BaseModel):
    is_disaster: bool
    disaster_type: str = Field(..., description="Corrected/confirmed disaster type")
    location_text: Optional[str] = Field(None, description="Raw location string extracted e.g. 'North Kolkata, West Bengal'")
    original_text: str = Field(..., description="Cleaned, combined title + key description under 100 words")
    ai_analysis: AiAnalysis
    image_description: Optional[str] = None


# ── API response models ───────────────────────────────────────────────────────

class FetchResponse(BaseModel):
    fetch_id: str = Field(..., description="Copy this and paste into POST /gemini/verify")
    total: int
    fetched_at: str
    posts: List[RawRedditPost]


class VerifyRequest(BaseModel):
    fetch_id: str = Field(..., description="fetch_id from POST /reddit/fetch")
    reddit_ids: Optional[List[str]] = Field(
        default=None,
        description="Verify only specific posts. Leave null to verify all.",
    )


class VerifyResponse(BaseModel):
    total_verified: int
    total_saved: int
    total_rejected: int
    verified_at: str
    posts: List[DisasterDocument]


class DisasterResponse(BaseModel):
    total: int
    fetched_at: str
    posts: List[DisasterDocument]
