cat > README.md << 'EOF'
# Homework 6: Distributed Systems

## Part 1: Task Management REST API (Node.js + Express + MongoDB)
- CRUD operations for task management
- Categories and priority levels
- MongoDB integration

## Part 2: AI Memory System (FastAPI + MongoDB + Ollama)
- Short-term memory (sliding window)
- Long-term memory (session summaries)
- Episodic memory (fact extraction)

## Setup Instructions

### Part 1 (Node.js)
```bash
cd nodeapi
npm install
npm start
```
Client folder has the front end 
### Part 2 (FastAPI)
```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Technologies Used
- FastAPI
- MongoDB (Motor)
- Ollama (Local LLM)
- Node.js + Express
- Mongoose
EOF