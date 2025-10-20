import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/hw6")
DB_NAME = os.getenv("DB_NAME", "hw6")

_client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
db = _client[DB_NAME]

async def ping():
    """Check MongoDB connection"""
    return await db.command("ping")
