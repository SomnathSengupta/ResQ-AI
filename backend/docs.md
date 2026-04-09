

Overview (brief)
- This is a small FastAPI service to detect, verify (via Gemini), geocode and store disaster-related Reddit posts.
- Flow: reddit_fetch → fetch_cache → gemini_verify → geocoder → db → query endpoints.

Files — responsibilities and key parts
- main.py
  - FastAPI app and HTTP endpoints:
    - POST /reddit/fetch: calls reddit_fetcher.fetch_disaster_posts, stores results in cache (fetch_cache.save) and returns fetch_id + posts.
    - POST /gemini/verify: reads posts from fetch_cache.get, runs gemini_verifier.verify_post for each, upserts confirmed disasters to MongoDB via db.upsert_document, returns verification summary.
    - GET /disasters/stored: query MongoDB via db.query_documents and returns stored DisasterDocuments.
  - Initializes external clients and env checks: PRAW Reddit, Google GenAI client, MongoDB db = get_db().
  - Loads required env vars (REDDIT_CLIENT_ID/SECRET, GEMINI_API_KEY, MONGO_URI).

- reddit_fetcher.py
  - fetch_disaster_posts(reddit, subreddits, limit, disaster_type, from_ts, to_ts)
    - Uses PRAW to iterate recent posts per subreddit, filters by keyword/disaster_type and timestamps, deduplicates, constructs RawRedditPost Pydantic models, returns sorted list.
    - KEYWORDS list defines default disaster keywords.

- cache.py
  - FetchCache class and singleton fetch_cache.
    - save(posts) → stores batch keyed by uuid fetch_id with expiry (CACHE_TTL_SECONDS = 30min).
    - get(fetch_id, reddit_ids=None) → retrieves full batch or selected reddit_ids; evicts expired batches.
    - delete(fetch_id) → remove batch.
    - _evict_expired() cleans expired entries.

- gemini_verifier.py
  - verify_post(client, post) → runs Google Gemini model (MODEL_NAME) to classify/confirm disaster, extract location and produce GeminiResult, then:
    - on success: optionally geocodes location_text via geocoder.geocode, builds DisasterDocument with ai_analysis only if is_disaster true.
    - on failure: returns a safe rejected DisasterDocument (ai_analysis None).
  - _build_prompt_md builds a Markdown prompt including image/metadata.
  - _resolve_image picks image URL or thumbnail.

- geocoder.py
  - geocode(location_text) → uses OpenStreetMap Nominatim HTTP API to resolve to Location (city/state/country and Coordinates lat/lng).
  - Enforces 1 request/sec rate limiting per Nominatim ToS, requires NOMINATIM_EMAIL env to be set (User-Agent header).
  - Returns models.Location or None on failure.

- db.py
  - MongoDB helpers using pymongo:
    - get_db(): initializes MongoClient, calls _ensure_indexes on disasters collection.
    - upsert_document(db, doc: DisasterDocument): upserts by reddit_id (adds _updated_at).
    - query_documents(db, ...filters...): builds filter for disaster_type, status, ai_analysis fields, created_at range; rehydrates nested models (Location, AiAnalysis, Coordinates) and returns list[DisasterDocument].
  - _ensure_indexes() migrates legacy fields, removes duplicates, creates useful indexes.

- models.py
  - Pydantic models that define data structures used across the app:
    - Coordinates, Location, AiAnalysis
    - RawRedditPost (internal fetch model)
    - DisasterDocument (DB model)
    - GeminiResult (expected Gemini JSON schema)
    - API request/response models: FetchResponse, VerifyRequest, VerifyResponse, DisasterResponse

Important runtime details & integrations
- External services: Reddit (PRAW), Google Gemini (google.genai), MongoDB, Nominatim (OpenStreetMap).
- Required env vars: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, GEMINI_API_KEY, MONGO_URI (checked at startup).
- Rate-limiting: geocoder enforces 1 req/sec to Nominatim.
- Cache TTL: batches expire after 30 minutes to avoid memory bloat.
- Error handling:
  - reddit_fetcher prints warnings for subreddit fetch errors.
  - gemini_verifier returns a safe rejected DisasterDocument on Gemini failure.
  - db._ensure_indexes attempts to migrate/remove legacy data and deduplicate.
- Data flow summary:
  1. Client calls POST /reddit/fetch → reddit_fetcher returns RawRedditPost[] → saved in fetch_cache with fetch_id.
  2. Client calls POST /gemini/verify with fetch_id → fetch_cache.get returns posts → gemini_verifier.verify_post calls Gemini → optional geocode → create DisasterDocument → confirmed docs upserted to MongoDB.
  3. Client calls GET /disasters/stored → db.query_documents returns stored DisasterDocument[].
