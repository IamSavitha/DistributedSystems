# app/routers/aggregate.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..db import db

router = APIRouter(prefix="/aggregate", tags=["aggregate"])

@router.get("/{user_id}")
async def aggregate_user(user_id: str):
    """
    Return daily message counts + recent summaries for a given user.
    """
    try:
        # --- daily message counts ---
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": -1}},
            {"$limit": 14}  # last 2 weeks
        ]
        msgs = await db["messages"].aggregate(pipeline).to_list(length=None)

        # --- most recent summaries ---
        summaries = await db["summaries"].find(
            {"user_id": user_id},
            {"_id": 0, "scope": 1, "text": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5).to_list(length=None)

        return {"daily_message_counts": msgs, "recent_summaries": summaries}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
