from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from .db import db

COLL = db["memories"]

def _doc_to_out(d):
    return {
        "id": str(d["_id"]),
        "user_id": d["user_id"],
        "role": d["role"],
        "text": d["text"],
        "tags": d.get("tags", []),
        "created_at": d["created_at"],
    }

async def add_memory(mem):
    doc = {**mem.model_dump(), "created_at": datetime.utcnow()}
    res = await COLL.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _doc_to_out(doc)

async def list_memories(user_id: str, tags: Optional[List[str]] = None, limit: int = 50):
    query = {"user_id": user_id}
    if tags:
        query["tags"] = {"$in": tags}
    cursor = COLL.find(query).sort("created_at", -1).limit(limit)
    return [_doc_to_out(d) async for d in cursor]

async def topk_recent(user_id: str, k: int, tags: Optional[List[str]] = None):
    return await list_memories(user_id, tags, limit=k)
