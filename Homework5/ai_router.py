# ai_router.py
import os
import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
MAX_HISTORY = 16  # how many past messages to send to the model

router = APIRouter(prefix="/ai", tags=["ai"])

async def call_ollama_chat(messages, model: str):
    """
    messages: list of {"role":"user"/"assistant"/"system","content":"..."}
    """
    url = f"{OLLAMA_URL}/api/chat"
    payload = {"model": model or DEFAULT_MODEL, "messages": messages, "stream": False}
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        # Ollama /api/chat returns {"message": {"role": "...", "content": "..."}, ...}
        return data["message"]["content"]

@router.get("/conversations", response_model=List[schemas.ConversationOut])
def list_conversations(db: Session = Depends(get_db)):
    return db.query(models.Conversation).order_by(models.Conversation.id.desc()).all()

@router.get("/messages/{conversation_id}", response_model=List[schemas.MessageOut])
def list_messages(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.get(models.Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.id.asc())
        .all()
    )

@router.post("/chat", response_model=schemas.ChatOut, status_code=status.HTTP_201_CREATED)
async def chat(body: schemas.ChatIn, db: Session = Depends(get_db)):
    # 1) get or create conversation
    conv_id = body.conversation_id
    if conv_id is None:
        title = body.message.strip().split("\n", 1)[0][:80] or "New Conversation"
        conv = models.Conversation(title=title)
        db.add(conv); db.commit(); db.refresh(conv)
        conv_id = conv.id
    else:
        conv = db.get(models.Conversation, conv_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # 2) save user message
    user_msg = models.Message(conversation_id=conv_id, role="user", content=body.message)
    db.add(user_msg); db.commit(); db.refresh(user_msg)

    # 3) build history for model
    history_q = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conv_id)
        .order_by(models.Message.id.asc())
    )
    msgs = [{"role": m.role, "content": m.content} for m in history_q][-MAX_HISTORY:]

    # 4) call Ollama
    try:
        reply_text = await call_ollama_chat(msgs, body.model or DEFAULT_MODEL)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ollama error: {e}")

    # 5) save assistant message
    asst_msg = models.Message(conversation_id=conv_id, role="assistant", content=reply_text)
    db.add(asst_msg); db.commit(); db.refresh(asst_msg)

    return schemas.ChatOut(conversation_id=conv_id, assistant_message=asst_msg)
