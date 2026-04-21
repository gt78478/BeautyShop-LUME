# 🌸 БьютиШоп Чили

> Интернет-магазин косметической продукции, ориентированный на чилийский рынок.
> Учебный проект — полный стек от базы данных до фронтенда.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Стек технологий](#-стек-технологий)
- [Архитектура](#-архитектура)
- [Функциональность](#-функциональность)
- [Быстрый старт](#-быстрый-старт)
- [API Документация](#-api-документация)
- [Переменные окружения](#-переменные-окружения)
- [Диаграммы](#-диаграммы)
- [Авторы](#-авторы)

---

## 🛍 О проекте

**БьютиШоп Чили** — полнофункциональный интернет-магазин косметики с русским интерфейсом по умолчанию, локализацией под чилийский рынок (CLP, RUT, регионы Чили) и учебной интеграцией платёжного сценария.

Проект разработан в рамках учебной практики и демонстрирует реализацию:
- REST API на FastAPI с JWT-авторизацией
- Реляционной базы данных PostgreSQL с ORM и миграциями
- Адаптивного фронтенда на чистом JavaScript без тяжёлых фреймворков
- Интеграции с внешними платёжными сервисами

---

## 🛠 Стек технологий

### Backend
| Технология | Версия | Назначение |
|---|---|---|
| Python | 3.11+ | Основной язык бэкенда |
| FastAPI | 0.111 | REST API фреймворк |
| SQLAlchemy | 2.x async | ORM для работы с БД |
| Alembic | 1.13 | Миграции базы данных |
| Pydantic v2 | 2.x | Валидация данных и схемы |
| python-jose | 3.x | JWT токены |
| bcrypt | 4.x | Хэширование паролей |
| uvicorn | 0.29 | ASGI сервер |

### Frontend
| Технология | Назначение |
|---|---|
| HTML5 + CSS3 | Разметка и стилизация |
| Vanilla JavaScript (ES2023) | Логика и взаимодействие с API |
| Vite 5 | Сборщик и dev-сервер |
| CSS Custom Properties | Дизайн-система |

### База данных и инфраструктура
| Технология | Назначение |
|---|---|
| PostgreSQL 16 | Основная СУБД |
| Docker / docker-compose | Локальное окружение |
| Railway / Render | Деплой (production) |
| GitHub Actions | CI/CD |

### Внешние сервисы
| Сервис | Назначение |
|---|---|
| Mercado Pago | Основная платёжная система (Чили) |
| Stripe | Резервная платёжная система |
| Webpay (Transbank) | Локальная чилийская система |
| SendGrid / SMTP | Транзакционные email |

---

## 🏗 Архитектура

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────────────────────┐
│                 │ ─────────────────► │           FastAPI Backend        │
│    Frontend     │                    │                                  │
│  HTML/CSS/JS    │ ◄───────────────── │  Routers → Services → ORM       │
│    (Vite)       │     JSON Response  │                                  │
└─────────────────┘                    └──────────────┬──────────────────┘
                                                      │ SQLAlchemy async
                                                      ▼
                                          ┌─────────────────────┐
                                          │    PostgreSQL DB     │
                                          │  (16 таблиц)        │
                                          └─────────────────────┘
                                                      
                                       External Services:
                                       ┌──────────────────┐
                                       │  Mercado Pago    │
                                       │  Stripe          │
                                       │  SendGrid        │
                                       └──────────────────┘
```

---

## ✅ Функциональность

### 👤 Для покупателей
- [x] Регистрация и авторизация (JWT access + refresh токены)
- [x] Просмотр каталога с фильтрацией по категории, бренду, цене
- [x] Полнотекстовый поиск по товарам
- [x] Страница товара с галереей, описанием и отзывами
- [x] Корзина (для гостей и авторизованных)
- [x] Wishlist (список желаний)
- [x] Оформление заказа с выбором адреса и доставки
- [x] Оплата через Mercado Pago / Stripe
- [x] История заказов и отслеживание статуса
- [x] Личный кабинет: профиль, адреса, отзывы
- [x] Email-уведомления о заказе

### ⚙️ Для администраторов
- [x] CRUD товаров и категорий
- [x] Управление заказами и статусами
- [x] Управление пользователями и ролями
- [x] Промокоды и скидки
- [x] Дашборд со статистикой

### 🌐 Локализация
- [x] Испанский (es-CL) — основной язык
- [x] Английский (en) — дополнительный
- [x] Валюта CLP (формат `$12.990`)
- [x] Поле RUT в форме оплаты
- [x] Регионы Чили в форме адреса

---

## 🚀 Быстрый старт

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (или Docker)
- Git

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/beautyshop-chile.git
cd beautyshop-chile
```

### 2. Запуск PostgreSQL через Docker

```bash
docker-compose up -d postgres
```

> Для быстрого локального старта PostgreSQL не обязателен: backend по умолчанию использует SQLite `backend/beautyshop.db`.

### Запуск всего проекта через Docker Compose

```bash
docker compose up --build
```

После запуска:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

Остановить:

```bash
docker compose down
```

Сбросить PostgreSQL-данные:

```bash
docker compose down -v
```

### 3. Настройка бэкенда

```bash
cd backend

# Создать виртуальное окружение
python3 -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# Установить зависимости
pip install -r requirements.txt

# Скопировать и заполнить переменные окружения
cp .env.example .env

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

API будет доступно на: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

Таблицы и демо-данные создаются автоматически при старте. Демо-аккаунты:

- `demo@beautyshop.cl` / `demo1234`
- `admin@beautyshop.cl` / `admin123`

### 4. Настройка фронтенда

```bash
cd frontend

# Установить зависимости
npm install

# Скопировать переменные
cp .env.example .env

# Запустить dev-сервер
npm run dev
```

Фронтенд будет доступен на: `http://localhost:5173`

---

## 📖 API Документация

После запуска бэкенда интерактивная документация доступна по адресу:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Основные эндпоинты

| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Регистрация | — |
| `POST` | `/auth/login` | Вход, получение JWT | — |
| `POST` | `/auth/refresh` | Обновление токена | — |
| `GET` | `/products` | Список товаров (фильтры, поиск, пагинация) | — |
| `GET` | `/products/{id}` | Детали товара | — |
| `GET` | `/cart` | Текущая корзина | ✅ |
| `POST` | `/cart/items` | Добавить товар в корзину | ✅ |
| `POST` | `/orders` | Создать заказ | ✅ |
| `GET` | `/orders` | История заказов | ✅ |
| `POST` | `/payments/create` | Создать демо-платёж | ✅ |
| `POST` | `/payments/webhook` | Webhook от платёжной системы | — |
| `GET` | `/users/me` | Профиль текущего пользователя | ✅ |
| `POST` | `/reviews` | Написать отзыв | ✅ |
| `GET` | `/admin/dashboard` | Статистика (admin only) | 🔐 |

> 🔐 — требует роль `admin` | ✅ — требует авторизацию

---

## 🔑 Переменные окружения

Скопируй `backend/.env.example` в `backend/.env` и заполни:

```env
# База данных
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/beautyshop

# JWT
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your-mp-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Stripe (резерв)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@beautyshop.cl

# App
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173
```

## 📐 Диаграммы

Use Case и Component диаграммы открываются в [draw.io](https://app.diagrams.net):

| Файл | Тип | Описание |
|---|---|---|
| `3_Diagramms/usecase-diagram.drawio` | Use Case | Акторы: Гость, Покупатель, Администратор |
| `3_Diagramms/component-diagram.drawio` | Component | 4 слоя: Frontend → Backend → Services → DB |
| `3_Diagramms/seq-registration.puml` | Sequence | Регистрация пользователя |
| `3_Diagramms/seq-cart.puml` | Sequence | Добавление товара в корзину |
| `3_Diagramms/seq-checkout.puml` | Sequence | Оформление заказа и оплата |
| `3_Diagramms/seq-catalog.puml` | Sequence | Просмотр каталога с фильтрами |
| `3_Diagramms/seq-auth.puml` | Sequence | JWT авторизация |

### Диаграммы последовательностей

#### Регистрация пользователя
![seq-registration](https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/gt78478/nanit_practice-Yun/main/tasks/3_Diagramms/seq-registration.puml)

#### Добавление товара в корзину
![seq-cart](https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/gt78478/nanit_practice-Yun/main/tasks/3_Diagramms/seq-cart.puml)

#### Оформление заказа и оплата
![seq-checkout](https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/gt78478/nanit_practice-Yun/main/tasks/3_Diagramms/seq-checkout.puml)

#### Просмотр каталога с фильтрами
![seq-catalog](https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/gt78478/nanit_practice-Yun/main/tasks/3_Diagramms/seq-catalog.puml)

#### JWT Авторизация
![seq-auth](https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/gt78478/nanit_practice-Yun/main/tasks/3_Diagramms/seq-auth.puml)

---

## 👨‍💻 Авторы

Проект разработан в рамках учебной практики.

| Роль | Имя |
|---|---|
| Backend разработка (FastAPI, PostgreSQL) | [@Юрченко Данил](https://github.com/gt78478) |
| Frontend разработка (HTML/CSS/JS) | [@Спиридонов Игорь](https://github.com/Coldhands-ai) |

---
