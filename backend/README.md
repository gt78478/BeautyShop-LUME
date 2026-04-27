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


Схема такая:

frontend
   ↓
routes.py
   ↓
schemas/shop.py проверяет входные данные
   ↓
database.py открывает сессию БД
   ↓
models/entities.py описывает таблицы
   ↓
serializers.py собирает красивый ответ
   ↓
frontend получает JSON


Главные файлы для понимания:

main.py — запуск приложения.
routes.py — все API-запросы.
entities.py — структура базы.
shop.py — формат данных.
security.py — пароли и JWT.
database.py — подключение к БД.


schemas/shop.py нужен не для БД напрямую
Он нужен для структуры данных между frontend и backend.
То есть:
frontend ↔ backend ↔ database
sсhemas работают вот здесь:
frontend ↔ backend

А models/entities.py работают вот здесь:
backend ↔ database