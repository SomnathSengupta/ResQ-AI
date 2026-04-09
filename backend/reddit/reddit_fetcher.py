import praw
from datetime import datetime, timezone
from typing import List, Optional
from models import RawRedditPost

KEYWORDS = [
    "earthquake", "flood", "cyclone", "hurricane", "wildfire",
    "tsunami", "landslide", "explosion", "accident", "tornado",
    "blizzard", "avalanche", "drought", "fire", "storm",
    "volcanic", "eruption", "disaster", "emergency", "crisis",
]


def fetch_disaster_posts(
    reddit: praw.Reddit,
    subreddits: List[str],
    limit: int = 50,
    disaster_type: Optional[str] = None,
    from_ts: Optional[int] = None,
    to_ts: Optional[int] = None,
) -> List[RawRedditPost]:
    keyword_filter = [disaster_type.lower()] if disaster_type else KEYWORDS
    now_ts = int(datetime.now(timezone.utc).timestamp())
    effective_to = to_ts if to_ts else now_ts

    results: List[RawRedditPost] = []
    seen_ids: set = set()

    for sub_name in subreddits:
        try:
            for post in reddit.subreddit(sub_name).new(limit=limit):
                if post.id in seen_ids:
                    continue

                post_ts = int(post.created_utc)
                if from_ts and post_ts < from_ts:
                    continue
                if post_ts > effective_to:
                    continue

                text = (post.title + " " + (post.selftext or "")).lower()
                matched = next((kw for kw in keyword_filter if kw in text), None)
                if not matched:
                    continue

                seen_ids.add(post.id)
                results.append(
                    RawRedditPost(
                        reddit_id=post.id,
                        title=post.title,
                        subreddit=post.subreddit.display_name,
                        author=str(post.author),
                        score=post.score,
                        upvote_ratio=post.upvote_ratio,
                        num_comments=post.num_comments,
                        flair=post.link_flair_text,
                        is_self_post=post.is_self,
                        domain=post.domain,
                        url=post.url,
                        permalink="https://reddit.com" + post.permalink,
                        thumbnail=post.thumbnail,
                        description=post.selftext or "",
                        disaster_type=matched,
                        created_at=datetime.utcfromtimestamp(post.created_utc)
                            .replace(tzinfo=timezone.utc).isoformat(),
                        fetched_at=datetime.now(timezone.utc).isoformat(),
                    )
                )
        except Exception as e:
            print(f"[WARN] Could not fetch r/{sub_name}: {e}")

    results.sort(key=lambda p: p.created_at, reverse=True)
    return results
