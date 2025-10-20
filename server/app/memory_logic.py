# app/memory_logic.py
from datetime import datetime
from ..ollama import generate_sync
from ..db import db

# configuration
SHORT_TERM_N = 8
SUMMARIZE_EVERY = 5
EMBED_MODEL = "nomic-embed-text"

async def short_term_window(user_id: str, session_id: str = None, n: int = SHORT_TERM_N):
    """Return last n messages for short-term memory."""
    q = {"user_id": user_id}
    if session_id:
        q["session_id"] = session_id
    cur = db["messages"].find(q).sort("created_at", -1).limit(n)
    return [m async for m in cur][::-1]

async def summarize_recent(user_id: str, session_id: str = None):
    """Summarize recent conversation and upsert into summaries."""
    msgs = await short_term_window(user_id, session_id, n=20)
    text_block = "\n".join([f"{m['role']}: {m['content']}" for m in msgs])
    summary_prompt = f"Summarize this conversation briefly in bullet points:\n{text_block}"
    summary = generate_sync(summary_prompt)
    await db["summaries"].insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "scope": "session",
        "text": summary,
        "created_at": datetime.utcnow(),
    })
    return summary

async def extract_episodes(user_id: str, session_id: str, message: str):
    """Extract a few short facts (stub)."""
    prompt = f"Extract up to 3 short factual statements from this text:\n{message}"
    facts = generate_sync(prompt)
    for line in facts.split("\n"):
        fact = line.strip("-• ").strip()
        if not fact:
            continue
        await db["episodes"].insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "fact": fact,
            "importance": 0.5,
            "embedding": [],
            "created_at": datetime.utcnow(),
        })
