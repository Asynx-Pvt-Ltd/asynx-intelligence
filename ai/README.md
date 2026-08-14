```bash
OPENAI_API_KEY=sk-proj-
POSTGRES_URI=
LLAMA_CLOUD_API_KEY=llx-

ENVIRONMENT=local
FRONTEND_HOST=http://localhost:5173
```

```bash
pip install uv
cd ai

uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

# Migrations

## CHECK the migration file in alembic/versions folder and update the file accordingly before migrating

```bash
alembic revision --autogenerate -m "message here"
alembic upgrade head
```

http://localhost:8000/docs
