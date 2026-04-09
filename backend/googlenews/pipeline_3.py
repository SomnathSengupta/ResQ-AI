from pygooglenews import GoogleNews
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline
import spacy
from geopy.geocoders import Nominatim
from pymongo import MongoClient
import time
from datetime import datetime


# MONGODB CONNECTION

client = MongoClient("mongodb+srv://disaster_user:1234Arashikage@cluster0.zkggmy5.mongodb.net/?appName=Cluster0")
db = client["disaster_db"]
collection = db["events"]

# INIT

model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load("en_core_web_sm")
geolocator = Nominatim(user_agent="disaster_system")

# ZERO-SHOT MODEL

zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# DISASTER LABELS

DISASTER_LABELS = {
    "earthquake": "earthquake seismic tremor ground shaking tectonic plates",
    "flood": "flood heavy rain water overflow inundation river overflow",
    "cyclone": "cyclone storm hurricane typhoon strong winds landfall",
    "wildfire": "wildfire forest fire burning vegetation flames smoke",
    "landslide": "landslide mudslide rockfall hill collapse debris"
}

label_embeddings = {
    k: model.encode(v) for k, v in DISASTER_LABELS.items()
}

#  SEVERITY

SEVERITY_WORDS = {
    5: ["massive", "deadly", "devastating", "kills", "destroyed"],
    4: ["severe", "strong", "heavy", "major"],
    3: ["moderate"],
    2: ["minor", "light"]
}

def detect_severity(text):
    for level, words in SEVERITY_WORDS.items():
        if any(w in text for w in words):
            return level
    return 3

# FETCH NEWS

def fetch_news():
    gn = GoogleNews(lang='en', country='IN')
    query = "(earthquake OR flood OR cyclone OR storm OR landslide OR wildfire)"
    news = gn.search(f"{query} when:1d")

    articles = []
    for e in news["entries"]:
        raw = e.get("title", "")
        title = raw.split(" - ")[0]

        articles.append({
            "title": title,
            "source": raw.split(" - ")[-1] if " - " in raw else "Unknown",
            "published": e.get("published", ""),
            "link": e.get("link", "")
        })

    return articles

# FILTER

def is_real_disaster(title):
    t = title.lower()

    reject = [
        "forecast", "prediction", "conference",
        "study", "climate change", "insurance",
        "warning", "expected", "alert"
    ]

    if any(r in t for r in reject):
        return False

    disaster_keywords = [
        "earthquake", "flood", "cyclone",
        "storm", "wildfire", "landslide"
    ]

    return any(k in t for k in disaster_keywords)

# REMOVE DUPLICATES

def remove_duplicates(articles):
    seen, unique = set(), []

    for a in articles:
        key = a["title"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(a)

    return unique

# CLUSTERING

def cluster_articles(articles, threshold=0.75):
    if not articles:
        return []

    texts = [a["title"] for a in articles]
    embeddings = model.encode(texts)

    clusters, used = [], set()

    for i in range(len(articles)):
        if i in used:
            continue

        cluster = [articles[i]]
        used.add(i)

        for j in range(i+1, len(articles)):
            if j in used:
                continue

            sim = cosine_similarity([embeddings[i]], [embeddings[j]])[0][0]

            if sim > threshold:
                cluster.append(articles[j])
                used.add(j)

        clusters.append(cluster)

    return clusters

#  AI LOCATION EXTRACTION

def extract_best_location(text):
    doc = nlp(text)

    candidates = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]

    # Add region phrases
    words = text.split()
    for i in range(len(words)-1):
        phrase = words[i] + " " + words[i+1]
        if any(k in phrase.lower() for k in ["central", "northern", "southern", "eastern", "western"]):
            candidates.append(phrase)

    if not candidates:
        return None

    candidates = list(set(candidates))

    result = zero_shot(text, candidate_labels=candidates)
    return result["labels"][0]


#  GEOCODING

def geocode_detailed(loc):
    try:
        time.sleep(1)
        g = geolocator.geocode(loc, addressdetails=True, language="en")

        if not g or "address" not in g.raw:
            return None

        addr = g.raw["address"]

        return {
            "city": addr.get("city") or addr.get("town") or addr.get("village"),
            "state": addr.get("state") or addr.get("region"),
            "country": addr.get("country"),
            "importance": g.raw.get("importance", 0),
            "lat": g.latitude,
            "lon": g.longitude
        }

    except Exception as e:
        print("Geocode error:", e)

    return None

# CLASSIFIER

def classify_event(title):
    t = title.lower()
    emb = model.encode(t)

    best_type, best_score = None, -1

    for disaster, label_emb in label_embeddings.items():
        score = cosine_similarity([emb], [label_emb])[0][0]

        if score > best_score:
            best_score = score
            best_type = disaster

    if best_score < 0.3:
        return {"type": "unknown", "urgency": 1, "confidence": round(float(best_score), 2)}

    return {
        "type": best_type,
        "urgency": detect_severity(t),
        "confidence": round(float(best_score), 2)
    }

# BUILD EVENT

def build_event(article, geo, ai):
    return {
        "source": "news",
        "sourceUrl": article["link"],

        "location": {
            "city": geo.get("city") or "",
            "state": geo.get("state") or "",
            "country": geo.get("country") or "",
            "coordinates": {
                "lat": geo["lat"],
                "lng": geo["lon"]
            }
        },

        "originalText": article["title"],

        "aiAnalysis": {
            "category": ai["type"],
            "urgency": ai["urgency"],
            "confidence": ai.get("confidence", 0.5),
            "credibility": "Medium",
            "summary": article["title"]
        },

        "disasterType": ai["type"],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "status": "active"
    }

# MAIN PIPELINE

def process():
    articles = fetch_news()
    print("Fetched:", len(articles))

    articles = [a for a in articles if is_real_disaster(a["title"])]
    print("After filter:", len(articles))

    articles = remove_duplicates(articles)
    clusters = cluster_articles(articles)

    final_events = []

    for cluster in clusters:
        article = cluster[0]

        best_loc = extract_best_location(article["title"])
        if not best_loc:
            continue

        geo = geocode_detailed(best_loc)
        if not geo:
            continue

        ai = classify_event(article["title"])
        event = build_event(article, geo, ai)

        final_events.append(event)

    return final_events

# SAVE TO DB

def save_to_db(events):
    for e in events:
        if not collection.find_one({"originalText": e["originalText"]}):
            collection.insert_one(e)