from fastapi import APIRouter
from ..db import ping

router = APIRouter()

@router.get("/health")
async def health():
    try:
        await ping()
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
