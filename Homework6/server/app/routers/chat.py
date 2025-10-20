# app/routers/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.ollama import generate_sync
from app.db import db

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Configuration
SHORT_TERM_N = 8
SUMMARIZE_EVERY = 5
TOP_K_EPISODES = 5

class ChatRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = "default"
    message: str

class ChatResponse(BaseModel):
    reply: str
    short_term_count: int
    long_term_summary: Optional[str] = None
    episodic_facts: list[str] = []

async def get_short_term_messages(user_id: str, session_id: str, n: int = SHORT_TERM_N):
    """Fetch last N messages for short-term memory."""
    cursor = db["messages"].find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(n)
    msgs = await cursor.to_list(length=n)
    return msgs[::-1]  # reverse to chronological order

async def get_long_term_summaries(user_id: str, session_id: str):
    """Fetch session and lifetime summaries."""
    # Get session summary
    session_summary = await db["summaries"].find_one(
        {"user_id": user_id, "session_id": session_id, "scope": "session"},
        sort=[("created_at", -1)]
    )
    
    # Get lifetime summary
    lifetime_summary = await db["summaries"].find_one(
        {"user_id": user_id, "session_id": None, "scope": "user"},
        sort=[("created_at", -1)]
    )
    
    summary_text = ""
    if lifetime_summary:
        summary_text += f"Lifetime context: {lifetime_summary['text']}\n"
    if session_summary:
        summary_text += f"Session context: {session_summary['text']}\n"
    
    return summary_text if summary_text else None

async def get_relevant_episodes(user_id: str, message: str, k: int = TOP_K_EPISODES):
    """Retrieve top-k relevant episodic facts (stub - no embedding search yet)."""
    cursor = db["episodes"].find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(k)
    episodes = await cursor.to_list(length=k)
    return [ep["fact"] for ep in episodes]

async def extract_and_store_episodes(user_id: str, session_id: str, message: str):
    """Extract facts from user message and store as episodes."""
    prompt = f"""Extract up to 3 short, important factual statements from this message.
Return only the facts, one per line, no numbering or bullets.

Message: {message}

Facts:"""
    
    try:
        facts_text = generate_sync(prompt)
        facts = [f.strip().strip("-•").strip() for f in facts_text.split("\n") if f.strip()]
        
        for fact in facts[:3]:  # limit to 3
            if len(fact) > 10:  # must be meaningful
                await db["episodes"].insert_one({
                    "user_id": user_id,
                    "session_id": session_id,
                    "fact": fact,
                    "importance": 0.5,
                    "embedding": [],  # TODO: add real embeddings
                    "created_at": datetime.utcnow()
                })
    except Exception as e:
        print(f"Episode extraction error: {e}")

async def should_summarize(user_id: str, session_id: str) -> bool:
    """Check if we should trigger summarization."""
    count = await db["messages"].count_documents({
        "user_id": user_id,
        "session_id": session_id,
        "role": "user"
    })
    return count > 0 and count % SUMMARIZE_EVERY == 0

async def create_session_summary(user_id: str, session_id: str):
    """Generate and store session summary."""
    # Get recent messages for summarization
    cursor = db["messages"].find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(20)
    msgs = await cursor.to_list(length=20)
    msgs = msgs[::-1]
    
    if not msgs:
        return
    
    # Build conversation text
    convo_text = "\n".join([f"{m['role']}: {m['content']}" for m in msgs])
    
    # Generate summary
    summary_prompt = f"""Summarize this conversation in 3-5 concise bullet points.
Focus on key topics, decisions, and important information.

Conversation:
{convo_text}

Summary (bullet points):"""
    
    try:
        summary = generate_sync(summary_prompt)
        
        await db["summaries"].insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "scope": "session",
            "text": summary,
            "created_at": datetime.utcnow()
        })
        
        print(f"✓ Created session summary for {user_id}/{session_id}")
    except Exception as e:
        print(f"Summarization error: {e}")

def build_chat_prompt(message: str, short_term_msgs: list, long_term_summary: str, episodes: list[str]) -> str:
    """Compose the full prompt with all memory types."""
    parts = []
    
    # Long-term context
    if long_term_summary:
        parts.append(f"=== Long-term Memory ===\n{long_term_summary}")
    
    # Short-term conversation history
    if short_term_msgs:
        parts.append("=== Recent Conversation ===")
        for msg in short_term_msgs:
            parts.append(f"{msg['role']}: {msg['content']}")
    
    # Episodic facts
    if episodes:
        parts.append(f"=== Relevant Facts === {', '.join(episodes)}")
    
    # Current message
    parts.append(f"\nUser: {message}\nAssistant:")
    
    return "\n".join(parts)

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Main chat endpoint with short-term, long-term, and episodic memory."""
    try:
        session_id = req.session_id or "default"
        
        # 1. Save user message
        await db["messages"].insert_one({
            "user_id": req.user_id,
            "session_id": session_id,
            "role": "user",
            "content": req.message,
            "created_at": datetime.utcnow()
        })
        
        # 2. Get short-term memory
        short_term_msgs = await get_short_term_messages(req.user_id, session_id)
        
        # 3. Get long-term summaries
        long_term_summary = await get_long_term_summaries(req.user_id, session_id)
        
        # 4. Get relevant episodic facts
        episodes = await get_relevant_episodes(req.user_id, req.message)
        
        # 5. Build prompt and get LLM response
        system_prompt = "You are a helpful AI assistant with access to conversation history and context."
        chat_prompt = build_chat_prompt(req.message, short_term_msgs, long_term_summary, episodes)
        
        print("\n--- CHAT PROMPT ---")
        print(chat_prompt[:500])
        print("-------------------\n")
        
        reply = generate_sync(chat_prompt, system=system_prompt)
        
        # 6. Save assistant reply
        await db["messages"].insert_one({
            "user_id": req.user_id,
            "session_id": session_id,
            "role": "assistant",
            "content": reply,
            "created_at": datetime.utcnow()
        })
        
        # 7. Extract episodes from user message (async, best effort)
        await extract_and_store_episodes(req.user_id, session_id, req.message)
        
        # 8. Check if summarization is needed
        if await should_summarize(req.user_id, session_id):
            await create_session_summary(req.user_id, session_id)
        
        # 9. Return response
        return ChatResponse(
            reply=reply,
            short_term_count=len(short_term_msgs),
            long_term_summary=long_term_summary,
            episodic_facts=episodes
        )
        
    except Exception as e:
        print(f"CHAT ERROR: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")