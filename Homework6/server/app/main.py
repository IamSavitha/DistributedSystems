from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, memory, chat

app = FastAPI(title="AI Memory FastAPI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(memory.router)
app.include_router(chat.router)
