from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class MemoryIn(BaseModel):
    user_id: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(user|assistant|system)$")
    text: str = Field(..., min_length=1, max_length=2000)
    tags: List[str] = []

class MemoryOut(MemoryIn):
    id: str
    created_at: datetime

class ChatRequest(BaseModel):
    user_id: str
    message: str
    k: int = 5
    tags: Optional[List[str]] = None

class ChatResponse(BaseModel):
    answer: str
    used_memories: List[MemoryOut] = []
