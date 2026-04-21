# BeautyShop Chile Backend

FastAPI API for the BeautyShop Chile practice project.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The default `DATABASE_URL` uses SQLite for a quick start. For PostgreSQL, run root `docker-compose.yml` and set:

```env
DATABASE_URL=postgresql+psycopg://beautyshop:beautyshop@localhost:5432/beautyshop
```

Seed users:

- `demo@beautyshop.cl` / `demo1234`
- `admin@beautyshop.cl` / `admin123`

