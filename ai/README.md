```bash
OPENAI_API_KEY=sk-proj-
POSTGRES_URI=

ENVIRONMENT=local
FRONTEND_HOST=http://localhost:5173
```

```bash
pip install uv 
cd ai

uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

http://localhost:8000/docs