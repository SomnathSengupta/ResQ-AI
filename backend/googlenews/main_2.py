from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pipeline import process, save_to_db

#INIT APP

app = FastAPI(title="Disaster Intelligence API")

#CORS CONFIG

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MONGODB CONNECTION

client = MongoClient("mongodb+srv://disaster_user:1234Arashikage@cluster0.zkggmy5.mongodb.net/?appName=Cluster0")
db = client["disaster_db"]
collection = db["events"]

# ROOT

@app.get("/")
def home():
    return {"message": "Disaster API is running"}


# RUN PIPELINE

@app.post("/refresh")
def refresh_data():
    events = process()

    if not events:
        return {"message": "No valid events found"}

    save_to_db(events)

    return {
        "message": "Pipeline executed successfully",
        "events_added": len(events)
    }

# GET ALL EVENTS

@app.get("/events")
def get_events(limit: int = 50):
    data = list(collection.find({"aiAnalysis.urgency": {"$gt": 3}}, {"_id": 0}).limit(limit))
    return {"count": len(data), "data": data}

# FILTER BY LOCATION

@app.get("/events/location")
def get_by_location(q: str = Query(..., description="Search by city/state/country")):
    data = list(collection.find({
        "$or": [
            {"location.city": {"$regex": q, "$options": "i"}},
            {"location.state": {"$regex": q, "$options": "i"}},
            {"location.country": {"$regex": q, "$options": "i"}}
        ]
    }, {"_id": 0}))

    return {"count": len(data), "data": data}

# FILTER BY DISASTER TYPE

@app.get("/events/type")
def get_by_type(disasterType: str):
    data = list(collection.find(
        {"disasterType": disasterType},
        {"_id": 0}
    ))
    return {"count": len(data), "data": data}


# FILTER BY URGENCY

@app.get("/events/urgency")
def get_by_urgency(level: int = Query(..., ge=1, le=5)):
    data = list(collection.find(
        {"aiAnalysis.urgency": level},
        {"_id": 0}
    ))
    return {"count": len(data), "data": data}

#  HIGH PRIORITY EVENTS

@app.get("/events/high-priority")
def high_priority():
    data = list(collection.find(
        {},
        {"_id": 0}
    ).sort("aiAnalysis.urgency", -1).limit(20))

    return {"count": len(data), "data": data}


# FILTER BY COUNTRY

@app.get("/events/country")
def get_by_country(country: str):
    data = list(collection.find(
        {"location.country": {"$regex": country, "$options": "i"}},
        {"_id": 0}
    ))
    return {"count": len(data), "data": data}


# DELETE ALL EVENTS

@app.delete("/events")
def delete_all():
    result = collection.delete_many({})
    return {"deleted": result.deleted_count}