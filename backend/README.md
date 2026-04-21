# БьютиШоп Чили: backend

Backend-часть учебного интернет-магазина косметики. API написан на FastAPI, данные хранятся через SQLAlchemy. По умолчанию для быстрого запуска используется SQLite, а в Docker Compose подключается PostgreSQL.

## Локальный запуск

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Документация API:

```text
http://localhost:8000/docs
```

Для PostgreSQL запусти корневой `docker-compose.yml` и укажи:

```env
DATABASE_URL=postgresql+psycopg://beautyshop:beautyshop@localhost:5432/beautyshop
```

Демо-пользователи:

- `demo@beautyshop.cl` / `demo1234`
- `admin@beautyshop.cl` / `admin123`

