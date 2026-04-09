import json
import os
from google import genai
from google.genai import types
from models import RawRedditPost, GeminiResult, DisasterDocument, Location
from geocoder import geocode

MODEL_NAME = "gemini-3.1-flash-lite-preview"

SYSTEM_PROMPT = (
    "You are a disaster-event verification assistant for Reddit posts. "
    "Determine if the post describes a real disaster/emergency. "
    "Extract the location as a specific string (e.g. 'North Kolkata, West Bengal, India'). "
    "Combine the title and key parts of the description into a clean original_text under 100 words. "
    "Classify the category as one of: Rescue, Relief, Damage, Warning, Casualty, Other. "
    "Rate urgency 1-5 (5 = critical, immediate threat to life). "
    "Rate credibility as High, Medium, or Low based on detail and source. "
    "Respond ONLY with valid JSON matching the schema. No markdown, no extra text. Use null for unknown fields."
)

_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
_SKIP_THUMBNAILS = {"self", "default", "nsfw", "spoiler", ""}


def _resolve_image(post: RawRedditPost) -> str:
    if post.url:
        ext = os.path.splitext(post.url.split("?")[0])[-1].lower()
        if ext in _IMAGE_EXTENSIONS:
            return post.url
    thumb = post.thumbnail or ""
    if thumb not in _SKIP_THUMBNAILS and thumb.startswith("http"):
        return thumb
    return ""


def _build_prompt_md(post: RawRedditPost) -> str:
    img_url  = _resolve_image(post)
    desc     = (post.description or "").strip()[:400]
    img_line = f"![post image]({img_url})" if img_url else "_No image._"

    return f"""# Reddit Post

## Metadata
| Field | Value |
|---|---|
| Subreddit | r/{post.subreddit} |
| Score | {post.score} |
| Comments | {post.num_comments} |
| Flair | {post.flair or "None"} |
| Keyword detected | `{post.disaster_type}` |

## Title
{post.title}

## Description
{desc if desc else "_No description._"}

## Image
{img_line}
""".strip()


def verify_post(client: genai.Client, post: RawRedditPost) -> DisasterDocument:
    """
    Runs Gemini verification on a raw Reddit post.
    If confirmed as a disaster, geocodes the location via Nominatim.
    Returns a DisasterDocument ready to be upserted into MongoDB.
    """
    prompt_md = _build_prompt_md(post)

    # Build combined original text fallback
    original_text_fallback = f"{post.title}. {(post.description or '').strip()[:200]}".strip()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0,
                thinking_config=types.ThinkingConfig(thinking_level="minimal"),
                response_mime_type="application/json",
                response_json_schema=GeminiResult.model_json_schema(),
            ),
            contents=prompt_md,
        )
        data = json.loads(response.text)
        result = GeminiResult(**data)

    except Exception as e:
        # Return a safe rejected document on Gemini failure
        return DisasterDocument(
            reddit_id=post.reddit_id,
            source="reddit",
            source_url=post.permalink,
            disaster_type=post.disaster_type,
            original_text=original_text_fallback,
            location=None,
            ai_analysis=None,
            status="active",
            created_at=post.created_at,
            fetched_at=post.fetched_at,
            is_saved=False,
        )

    # ── Geocode the location string Gemini extracted ──────────────────────
    location: Location | None = None
    if result.is_disaster and result.location_text:
        location = geocode(result.location_text)

    return DisasterDocument(
        reddit_id=post.reddit_id,
        source="reddit",
        source_url=post.permalink,
        disaster_type=result.disaster_type,
        original_text=result.original_text,
        location=location,
        ai_analysis=result.ai_analysis if result.is_disaster else None,
        status="active",
        created_at=post.created_at,
        fetched_at=post.fetched_at,
        is_saved=False,           # set to True in main.py after MongoDB save
    )
