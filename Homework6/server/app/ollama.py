# app/ollama.py
import os, requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:8b")

def generate_sync(prompt: str, system: str = "") -> str:
    """
    Call Ollama's /api/chat (messages array) instead of /api/generate.
    This is often more reliable and lets us pass system + user cleanly.
    """
    data = {
        "model": OLLAMA_MODEL,
        "messages": (
            [{"role": "system", "content": system}] if system.strip() else []
        ) + [{"role": "user", "content": prompt}],
        "stream": False,
    }
    try:
        r = requests.post(f"{OLLAMA_BASE}/api/chat", json=data, timeout=300)
        r.raise_for_status()
        j = r.json()
        # /api/chat returns {"message": {"role": "...", "content": "..."}, ...}
        msg = j.get("message") or {}
        return (msg.get("content") or "").strip()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Ollama error: {e}")
