# ---------- Base image ----------
FROM python:3.12-slim


ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


COPY app ./app
COPY alembic ./alembic
COPY pyproject.toml .


RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 8000

# ---------- Start command ----------
CMD ["sh", "-c", "alembic upgrade head 2>/dev/null || true && exec gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120"]