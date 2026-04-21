CREATE DATABASE shop_db;

-- 1. БАЗОВЫЕ ТАБЛИЦЫ (без зависимостей)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE product_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE shipment_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 2. ЗАВИСЯТ ОТ БАЗОВЫХ

CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    label TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    city TEXT,
    commune TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INT REFERENCES categories(id),
    brand_id INT REFERENCES brands(id),
    type_id INT REFERENCES product_type(id),
    description TEXT,
    amount INT,
    price_cents INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. ЗАВИСЯТ ОТ PRODUCTS / USERS

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    sort_order INT
);

CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES cart(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price_cents INT NOT NULL
);

-- 4. ORDERS (ВАЖНО РАНЬШЕ SHIPMENTS И PAYMENTS)

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    user_address_id INT REFERENCES user_addresses(id),
    order_status_id INT REFERENCES order_statuses(id),
    address TEXT,
    subtotal_cents INT,
    shipping_cents INT,
    discount_cents INT,
    total_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. ВСЁ, ЧТО ЗАВИСИТ ОТ ORDERS

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    product_name_snapshot TEXT,
    unit_price_cents_snapshot INT,
    quantity INT,
    line_total_cents INT
);

CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user INT REFERENCES users(id),
    old_status TEXT,
    new_status TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    note TEXT
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    provider TEXT, -- не конфликтует ли по смыслу с provider_payment_id
    status TEXT,
    amount_cents INT,
    provider_payment_id TEXT, -- тут мы планируем добавить табличку с провайдерами (payment_providers) по идее
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    raw_payload JSONB
);

-- 6. SHIPMENTS (после orders)

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    shipment_status_id INT REFERENCES shipment_statuses(id),
    carrier TEXT,
    tracking_number TEXT,
    label_url TEXT,
    shipping_cost_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipment_events (
    id SERIAL PRIMARY KEY,
    shipment_id INT REFERENCES shipments(id) ON DELETE CASCADE,
    status_before TEXT,
    status_new TEXT,
    description TEXT,
    event_time TIMESTAMP,
    raw_payload TEXT
);