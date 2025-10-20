# app/routers/memory.py
from fastapi import APIRouter, HTTPException
from app.db import db

router = APIRouter(prefix="/api/memory", tags=["memory"])

@router.get("/{user_id}")
async def get_user_memory(user_id: str):
    """
    Return memory overview for a user:
    - Last 16 messages in default session
    - Latest session summary
    - Latest lifetime summary
    - Last 20 episodic facts
    """
    try:
        # Get last 16 messages from default session
        messages = await db["messages"].find(
            {"user_id": user_id, "session_id": "default"}
        ).sort("created_at", -1).limit(16).to_list(length=16)
        messages = messages[::-1]  # reverse to chronological
        
        # Format messages
        messages_out = [
            {
                "role": m["role"],
                "content": m["content"],
                "created_at": m["created_at"].isoformat()
            }
            for m in messages
        ]
        
        # Get latest session summary
        session_summary = await db["summaries"].find_one(
            {"user_id": user_id, "scope": "session"},
            sort=[("created_at", -1)]
        )
        
        # Get lifetime user summary
        lifetime_summary = await db["summaries"].find_one(
            {"user_id": user_id, "scope": "user", "session_id": None},
            sort=[("created_at", -1)]
        )
        
        # Get last 20 episodic facts
        episodes = await db["episodes"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(length=20)
        
        episodes_out = [
            {
                "fact": ep["fact"],
                "importance": ep.get("importance", 0.5),
                "created_at": ep["created_at"].isoformat()
            }
            for ep in episodes
        ]
        
        return {
            "user_id": user_id,
            "last_16_messages": messages_out,
            "session_summary": session_summary["text"] if session_summary else None,
            "lifetime_summary": lifetime_summary["text"] if lifetime_summary else None,
            "last_20_episodes": episodes_out
        }
        
    except Exception as e:
        print(f"ERROR in get_user_memory: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))