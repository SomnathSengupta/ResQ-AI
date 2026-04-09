"""
db.py - MongoDB helpers
  - get_db()         : returns the disasterDB database handle
  - upsert_document(): insert or update a DisasterDocument by reddit_id
  - query_documents() : filter stored documents with optional criteria
"""

import os
from datetime import datetime, timezone
from typing import Optional, List

from pymongo import MongoClient, DESCENDING
from pymongo.collection import Collection
from pymongo.errors import OperationFailure
from dotenv import load_dotenv

from models import DisasterDocument, AiAnalysis, Location, Coordinates

load_dotenv()

_client: Optional[MongoClient] = None


def _deduplicate(col: Collection) -> None:
    pipeline = [
        {"$group": {"_id": "$reddit_id", "count": {"$sum": 1}, "ids": {"$push": "$_id"}, "latest": {"$last": "$_id"}}},
        {"$match": {"count": {"$gt": 1}}},
    ]
    removed = 0
    for group in col.aggregate(pipeline):
        ids_to_delete = [oid for oid in group["ids"] if oid != group["latest"]]
        if ids_to_delete:
            col.delete_many({"_id": {"$in": ids_to_delete}})
            removed += len(ids_to_delete)
    if removed:
        print(f"[DB] Removed {removed} duplicate(s).")


def _ensure_indexes(col: Collection) -> None:
    existing = col.index_information()

    # Drop any conflicting legacy indexes
    for name, info in list(existing.items()):
        if name == "_id_":
            continue
        keys = {k for k, _ in info.get("key", [])}
        if keys & {"redditId", "reddit_id"}:
            try:
                col.drop_index(name)
                print(f"[DB] Dropped legacy index '{name}'.")
            except OperationFailure:
                pass

    # Clean nulls and migrate legacy camelCase field
    col.delete_many({"reddit_id": {"$in": [None, ""]}})
    col.update_many(
        {"redditId": {"$exists": True}, "reddit_id": {"$exists": False}},
        [{"$set": {"reddit_id": "$redditId"}}],
    )

    _deduplicate(col)

    col.create_index("reddit_id", unique=True)
    col.create_index([("created_at", DESCENDING)])
    col.create_index("disaster_type")
    col.create_index("status")
    col.create_index("ai_analysis.urgency")
    col.create_index("ai_analysis.category")
    col.create_index("location.city")
    col.create_index("location.country")
    print("[DB] Indexes ready.")


def get_db():
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        db_name   = os.getenv("MONGO_DB_NAME", "disasterDB")
        _client   = MongoClient(mongo_uri)
        db        = _client[db_name]
        _ensure_indexes(db["disasters"])
        print(f"[DB] Connected → {mongo_uri.split('@')[-1]} / {db_name}")
        return db
    return _client[os.getenv("MONGO_DB_NAME", "disasterDB")]


# ── Write ─────────────────────────────────────────────────────────────────────

def upsert_document(db, doc: DisasterDocument) -> None:
    """Upsert a DisasterDocument into the 'disasters' collection."""
    data = doc.model_dump()
    data["_updated_at"] = datetime.now(timezone.utc).isoformat()
    db["disasters"].update_one(
        {"reddit_id": doc.reddit_id},
        {"$set": data},
        upsert=True,
    )


# ── Read ──────────────────────────────────────────────────────────────────────

def query_documents(
    db,
    disaster_type: Optional[str] = None,
    from_ts: Optional[int] = None,
    to_ts: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    min_urgency: Optional[int] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 50,
) -> List[DisasterDocument]:

    filt: dict = {}

    if disaster_type:
        filt["disaster_type"] = {"$regex": disaster_type, "$options": "i"}
    if status:
        filt["status"] = status
    if category:
        filt["ai_analysis.category"] = {"$regex": category, "$options": "i"}
    if min_urgency:
        filt["ai_analysis.urgency"] = {"$gte": min_urgency}
    if city:
        filt["location.city"] = {"$regex": city, "$options": "i"}
    if country:
        filt["location.country"] = {"$regex": country, "$options": "i"}
    if from_ts or to_ts:
        ts_filt: dict = {}
        if from_ts:
            ts_filt["$gte"] = datetime.utcfromtimestamp(from_ts).replace(tzinfo=timezone.utc).isoformat()
        if to_ts:
            ts_filt["$lte"] = datetime.utcfromtimestamp(to_ts).replace(tzinfo=timezone.utc).isoformat()
        filt["created_at"] = ts_filt

    cursor = (
        db["disasters"]
        .find(filt, {"_id": 0, "_updated_at": 0})
        .sort("created_at", DESCENDING)
        .limit(limit)
    )

    docs: List[DisasterDocument] = []
    for d in cursor:
        try:
            # Re-hydrate nested models
            if d.get("location"):
                coords = d["location"].get("coordinates")
                d["location"]["coordinates"] = Coordinates(**coords) if coords else None
                d["location"] = Location(**d["location"])
            if d.get("ai_analysis"):
                d["ai_analysis"] = AiAnalysis(**d["ai_analysis"])
            docs.append(DisasterDocument(**d))
        except Exception:
            pass
    return docs
