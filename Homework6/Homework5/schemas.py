from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ---------- Author ----------
class AuthorBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr  # email format validation

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class AuthorOut(AuthorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# ---------- Book ----------
class BookBase(BaseModel):
    title: str
    isbn: str
    publication_year: int = Field(ge=0, le=2100)
    available_copies: int = Field(default=1, ge=0)
    author_id: int

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = Field(default=None, ge=0, le=2100)
    available_copies: Optional[int] = Field(default=None, ge=0)
    author_id: Optional[int] = None

class BookOut(BookBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Helper list responses
class PaginatedAuthors(BaseModel):
    items: List[AuthorOut]
    page: int
    size: int
    total: int


# ---- Conversations ----
class ConversationCreate(BaseModel):
    title: str

class ConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# ---- Messages ----
class MessageCreate(BaseModel):
    conversation_id: int
    role: str
    content: str

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

# ---- Chat I/O ----
class ChatIn(BaseModel):
    conversation_id: Optional[int] = None
    message: str
    model: Optional[str] = None  # e.g., "llama3"

class ChatOut(BaseModel):
    conversation_id: int
    assistant_message: MessageOut